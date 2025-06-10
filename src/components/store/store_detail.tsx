import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { storeData } from '../../data/storeData'
import './storeDetail.css'
import { storeDetailAssets } from '../../data/storeDetailAssets'
import { doc, setDoc, deleteDoc, getDoc, query, collection, where, getDocs, DocumentData, QueryDocumentSnapshot, updateDoc, arrayRemove, arrayUnion, } from "firebase/firestore"
import { auth, db, storage } from "../../firebase"
import { useNavigate, useLocation } from 'react-router-dom';
import { ref, listAll, getDownloadURL } from "firebase/storage"

const tabs = ['가게메뉴', '상차림', '편의시설'] as const
type Tab = typeof tabs[number]


interface Review {
    id: string
    title: string
    content: string
    storeId: string
    nickname: string
    createdAt: any
    star?: number
    likes?: string[]
}

interface Comment {
    id: string
    content: string
    createdAt: any
    nickname: string
}


export default function StoreDetail() {
    const { name } = useParams()
    const storeName = decodeURIComponent(name || '')
    const selectedStore = storeData.find((s) => s.name === storeName)
    const [activeTab, setActiveTab] = useState<Tab>('가게메뉴')
    const [showAllFacilities, setShowAllFacilities] = useState(false)
    const titles = storeDetailAssets[selectedStore.name] || []
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const navigate = useNavigate();

    const [isFavorite, setIsFavorite] = useState(false)
    const storeId = `store${storeData.indexOf(selectedStore!) + 1}`

    const [storeRatings, setStoreRatings] = useState<Record<string, { average: number, count: number }>>({})

    const storeIndex = storeData.findIndex(s => s.name === selectedStore.name)
    const average = storeRatings[storeId]?.average || 0

    const [tabImages, setTabImages] = useState<string[]>([])


    //  별
    const getStoreRatingData = async (storeId: string) => {
        const q = query(collection(db, "reviews"), where("storeId", "==", storeId))
        const snapshot = await getDocs(q)
        const reviews = snapshot.docs.map(doc => doc.data())
        const count = reviews.length
        const total = reviews.reduce((sum, r) => sum + (r.star || 0), 0)
        const average = count ? total / count : 0
        return { average, count }
    }

    useEffect(() => {
        const fetchRating = async () => {
            if (!selectedStore) return
            const storeIndex = storeData.findIndex(s => s.name === selectedStore.name)
            if (storeIndex === -1) return
            const storeId = `store${storeIndex + 1}`
            const rating = await getStoreRatingData(storeId)
            setStoreRatings(prev => ({ ...prev, [storeId]: rating }))
        }

        fetchRating()
    }, [selectedStore])

    // 리뷰
    const [storeReviews, setStoreReviews] = useState<Review[]>([])

    useEffect(() => {
        const fetchStoreReviews = async () => {
            const storeId = `store${storeData.findIndex(s => s.name === selectedStore.name) + 1}`
            const q = query(
                collection(db, 'reviews'),
                where('storeId', '==', storeId)
            )
            const snapshot = await getDocs(q)
            const reviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[]

            // ⭐️ 별점 5점짜리만 추려서 최신순 정렬 후 3개만
            const filtered = reviews
                .filter(r => r.star === 5)
                .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
                .slice(0, 3)

            setStoreReviews(filtered)
        }

        fetchStoreReviews()
    }, [selectedStore])


    // 댓글
    const [reviewComments, setReviewComments] = useState<Record<string, Comment[]>>({})

    useEffect(() => {
        const fetchAllComments = async () => {
            const newComments: Record<string, Comment[]> = {}

            for (const review of storeReviews) {
                const snap = await getDocs(collection(db, "reviews", review.id, "comments"))
                newComments[review.id] = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Comment[]
            }

            setReviewComments(newComments)
        }

        if (storeReviews.length > 0) {
            fetchAllComments()
        }
    }, [storeReviews])




    const facilityIcons: Record<string, string> = {
        '주문배송': '/img/amenities/주문배송.svg',
        '무료wifi': '/img/amenities/무료wifi.svg',
        '남여화장실구분': '/img/amenities/남여화장실구분.svg',
        '단체이용예약가능': '/img/amenities/단체이용예약가능.svg',
        '예약가능': '/img/amenities/예약가능.svg',
        '주차장': '/img/amenities/주차장.svg',
        '제로페이': '/img/amenities/제로페이.svg',
        '유아의자': '/img/amenities/유아의자.svg',
        '포장가능': '/img/amenities/포장가능.svg',
        '일반식사메뉴': '/img/amenities/일반식사메뉴.svg',
    }



    const tabToFolderMap: Record<Tab, string> = {
        '가게메뉴': 'menu',
        '상차림': 'side',
        '편의시설': 'amenities',
    }


    const MAX_IMAGES = 10


    if (!selectedStore) return <div>가게 정보를 찾을 수 없습니다.</div>



    useEffect(() => {
        const checkFavorite = async () => {
            const user = auth.currentUser
            if (!user || !storeId) return

            const ref = doc(db, "favorites", storeId, "users", user.uid,)
            const snap = await getDoc(ref)
            setIsFavorite(snap.exists())
        }

        checkFavorite()
    }, [storeId])




    const handleToggle = async () => {
        const user = auth.currentUser;
        if (!user) return alert("로그인 후 이용해주세요.");

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return alert("유저 정보가 없습니다.");

        const { nickname, phone, email } = userDoc.data();

        const favRef = doc(db, "favorites", storeId, "users", user.uid);
        const favSnap = await getDoc(favRef);

        if (favSnap.exists()) {
            // 단골 해제
            await deleteDoc(favRef);
            await updateDoc(userRef, {
                favorites: arrayRemove(storeId),
            });
            setIsFavorite(false);
            alert("단골이 해제되었습니다!");
        } else {
            // 단골 등록
            await setDoc(favRef, {
                nickname,
                phone,
                email,
                createdAt: new Date(),
            });

            await updateDoc(userRef, {
                favorites: arrayUnion(storeId),
            });

            setIsFavorite(true);
            alert("단골로 등록되었습니다!");
        }
    };

    // console.log(selectedStore.detailImagelist)

    // tab이미지
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const folder = tabToFolderMap[activeTab]
                const folderRef = ref(storage, `stores/${storeId}/${folder}`)
                const res = await listAll(folderRef)

                const urls = await Promise.all(
                    res.items.map((itemRef) => getDownloadURL(itemRef))
                )

                setTabImages(urls)
            } catch (err) {
                console.error("이미지 불러오기 오류:", err)
                setTabImages([])
            }
        }

        if (storeId) fetchImages()
    }, [activeTab, storeId])

    // 이미지 확대
    const handleImageClick = (url: string) => {
        setSelectedImage(url)
    }

    const handleCloseModal = () => {
        setSelectedImage(null)
    }

    const handleCopyLink = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                alert("링크가 복사되었습니다!");
            })
            .catch(() => {
                alert("복사에 실패했습니다 ㅠㅠ");
            });
    };

    return (
        <div className="store-detail-wrapper">
            {/* 👇 대표 이미지 */}
            <div
                className="store-hero-image"
                style={{
                    backgroundImage: `url(${window.innerWidth <= 768
                            ? selectedStore.mobiledetailimage
                            : selectedStore.detailimage
                        })`,
                }}
            />


            {/* 👇 가게 정보 카드 */}
            <div className="store-info-card">
                {/* <img src={selectedStore.logo} alt="로고" className="store-main-logo" /> */}
                <div className="store-name-stars">
                    <h2 className="store-name">{selectedStore.name}</h2>
                    <div className="star-icons">
                        {[...Array(5)].map((_, i) => {
                            const value = i + 1
                            let src = ''
                            if (average >= value) {
                                src = '/img/icon/단골등록해제.svg' // 가득 찬 별
                            } else if (average + 0.5 >= value) {
                                src = '/img/icon/반쪽자리별.svg' // 반쪽 별
                            } else {
                                src = '/img/icon/단골등록.svg' // 빈 별
                            }

                            return <img key={i} src={src} alt="별" style={{ width: '16px', height: '16px', marginRight: '2px' }} />
                        })}
                        <span style={{ marginLeft: '6px', fontSize: '14px', color: '#444' }}>{average.toFixed(1)}점</span>
                    </div>

                </div>
                <div className="store-detail">
                    <span className="label">영업시간 :</span> {selectedStore.hours.split('/')[0]}
                    {selectedStore.point && (
                        <span className="point"> ※ {selectedStore.point}</span>
                    )}
                </div>
                <div className="store-detail">
                    <span className="label">휴무 :</span> {selectedStore.hours.split('/')[1].replace('휴무', '')}
                </div>

                <div className="store-actions">
                    <div className="action-item">
                        <a
                            href={`https://map.kakao.com/?q=${encodeURIComponent(selectedStore.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src="/img/icon/길찾기.svg" alt="길찾기" />
                            <span>길찾기</span>
                        </a>
                    </div>

                    <div className="action-item" onClick={handleCopyLink}>
                        <img src="/img/icon/공유하기.svg" alt="공유하기" />
                        <span>공유하기</span>
                    </div>

                    <div className="action-item" onClick={handleToggle}>
                        <img
                            src={
                                isFavorite
                                    ? "/img/icon/단골등록해제.svg"
                                    : "/img/icon/단골등록.svg"
                            }
                            alt={isFavorite ? "단골해제" : "단골등록"}
                        />
                        <span>{isFavorite ? "단골해제" : "단골등록"}</span>
                    </div>
                    <div className="action-item">
                        <img src="/img/icon/리뷰쓰기.svg" alt="리뷰쓰기" />
                        <span onClick={() => navigate('/write')}>리뷰쓰기</span>
                    </div>
                </div>

                <div className="facility-section">
                    <div className="facility-title">편의시설</div>
                    <div className="facility-icons">
                        {(showAllFacilities ? selectedStore.options : selectedStore.options.slice(0, 4)).map(option => (
                            facilityIcons[option] && (
                                <div className="facility-icon" key={option}>
                                    <div className={`facility-icon-img-wrapper ${option === "무료wifi" ? "wifi-padding" : ""}`}>
                                        <img src={facilityIcons[option]} alt={option} />
                                    </div>
                                    <p>{option}</p>
                                </div>
                            )
                        ))}
                    </div>
                    <div className="button-location">
                        {selectedStore.options.length > 4 && (
                            <button
                                className="more-button"
                                onClick={() => setShowAllFacilities(prev => !prev)}
                            >
                                {showAllFacilities
                                    ? '간략히 보기 ▲'
                                    : `+${selectedStore.options.length - 4}개 더보기 ▼`}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 👇 가게 소개 스토리 */}
            <div className={`store-story-wrapper ${selectedStore.name === "대가한우" ? "no-bg" : ""}`}>

                <div className="store-slogan">
                    {selectedStore.description.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>

                <div
                    className={`store-name-line ${selectedStore.name === '대가1호점' ? 'extra-padding' : ''
                        }`}
                >
                    <span className="store-name-text">{selectedStore.name}</span>
                    <div className="store-name-bar" />
                </div>


            </div>

            <div className="brand-inner">

                {/* 👇 브랜드 로고 + 서브로고 */}
                <div className={`store-brand-wrapper`}>
                    <img src="/img/logo/videologo.svg" alt="videologo" className="video-logo" />
                    <hr className="brand-divider-m" />
                    <div className="brand-text">KOREAN BEEF VILLAGE SAMGA</div>
                    <hr className="brand-divider-pc" />
                    {/* {[ "대가1호점"].includes(selectedStore.name) && (
                        <img src={selectedStore.logo} alt="logo" className="store-sub-logo" />
                    )} */}
                </div>

            </div>

            {/* 👇 PC / M 상세 이미지 분리 출력 */}
            <div className="store-detail-images-separated">
                {/* ✅ PC 환경일 때만 보여짐 */}
                <div className="detail-images-pc only-pc">
                    {selectedStore.detailImagelist
                        .filter((src) => /상세페이지_PC_\d+\.(jpg|png)$/i.test(src))
                        .map((src, idx) => (
                            <div className="pc-image-wrapper" key={`pc-${idx}`}>
                                <img
                                    src={src}
                                    alt={`PC 상세 이미지 ${idx + 1}`}
                                    className="store-image"
                                />
                                {titles[idx] && (
                                    <div className={`pc-image-text-overlay ${titles[idx].className}`}>
                                        {titles[idx].text.split("\n").map((line, i) => {
                                            const isDeawoong2 = titles[idx].className === "deawoong2";

                                            // ✅ 두 번째 줄: '는'만 하이라이트
                                            if (isDeawoong2 && i === 1) {
                                                const body = line.slice(0, -1);
                                                const last = line.slice(-1);
                                                return (
                                                    <div key={i}>
                                                        {body}
                                                        <span className="highlight">{last}</span>
                                                    </div>
                                                );
                                            }

                                            // ✅ 세 번째 줄: 전체 하이라이트
                                            if (isDeawoong2 && i === 2) {
                                                return (
                                                    <div key={i} className="highlight">
                                                        {line}
                                                    </div>
                                                );
                                            }

                                            return <div key={i}>{line}</div>;
                                        })}
                                    </div>
                                )}


                            </div>
                        ))}
                </div>

                {/* ✅ 모바일 환경일 때만 보여짐 */}
                <div className="detail-images-mobile only-mobile">
                    {selectedStore.detailImagelist
                        .filter((src) => /상세페이지_M_\d+\.(jpg|png)$/i.test(src))
                        .map((src, idx) => (
                            <img
                                key={`m-${idx}`}
                                src={src}
                                alt={`모바일 상세 이미지 ${idx + 1}`}
                                className="store-image"
                            />
                        ))}
                </div>


                {/* ✅ 모바일 환경일 때만 보여짐 */}
                <div className="detail-images-smobile only-smobile">
                    {selectedStore.detailImagelist
                        .filter((src) => /상세페이지_SM_\d+\.(jpg|png)$/i.test(src))
                        .map((src, idx) => (
                            <img
                                key={`m-${idx}`}
                                src={src}
                                alt={`모바일 상세 이미지 ${idx + 1}`}
                                className="store-image"
                            />
                        ))}
                </div>
            </div>




            {selectedStore.name === "도원식육식당" && (
                <div className="dowon-product-section">
                    <div className="dowon-product-inner">
                        <div className="dowon-product-title">
                            아이디어스 인기제품 <span className="highlight">구매하기</span>
                        </div>
                        {/* PC 버전 - 5개 모두 */}
                        <div className="dowon-product-grid dowon-only-pc">
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/25792545-088d-4d5c-bb89-762a3b6533b0?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/1.png" alt="1번 상품" />
                                    <div className="dowon-product-name">한우(대패)로스구이(2-3인)</div>
                                </a>
                            </div>
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/d0e10218-942c-4664-b1b3-0c6c770c9e7e?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/2.png" alt="2번 상품" />
                                    <div className="dowon-product-name">한우(만능)자투리1키로</div>
                                </a>
                            </div>
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/1953a42a-00ca-4418-af1b-576b2876e7f5?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/3.png" alt="3번 상품" />
                                    <div className="dowon-product-name">(눈꽃)(1++9)한우 등심(300G)</div>
                                </a>
                            </div>
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/4ee9f37c-16ff-4457-aab2-e823035a4b4d?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/4.png" alt="4번 상품" />
                                    <div className="dowon-product-name">(국내산)돼지 갈비찜</div>
                                </a>
                            </div>
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/bd28e21e-e78c-4296-ae61-1f48da56bbe2?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/5.png" alt="5번 상품" />
                                    <div className="dowon-product-name">(명품한우선물)한우특모듬0.6KG</div>
                                </a>
                            </div>
                        </div>

                        {/* 모바일 버전 - 4개만 */}
                        <div className="dowon-product-grid dowon-only-mobile">
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/25792545-088d-4d5c-bb89-762a3b6533b0?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/1.png" alt="1번 상품" />
                                    <div className="dowon-product-name">한우(대패)로스구이(2-3인)</div>
                                </a>
                            </div>
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/d0e10218-942c-4664-b1b3-0c6c770c9e7e?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/2.png" alt="2번 상품" />
                                    <div className="dowon-product-name">한우(만능)자투리1키로</div>
                                </a>
                            </div>
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/1953a42a-00ca-4418-af1b-576b2876e7f5?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/3.png" alt="3번 상품" />
                                    <div className="dowon-product-name">(눈꽃)(1++9)한우 등심(300G)</div>
                                </a>
                            </div>
                            <div className="dowon-product-item">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.idus.com/v2/product/4ee9f37c-16ff-4457-aab2-e823035a4b4d?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user">
                                    <img src="/samga/store/dowon/4.png" alt="4번 상품" />
                                    <div className="dowon-product-name">(국내산)돼지 갈비찜</div>
                                </a>
                            </div>
                        </div>

                    </div>
                    <div className="idius-all">
                        <a href="https://www.idus.com/v2/search?keyword=%EB%8F%84%EC%9B%90%20%ED%95%9C%EC%9A%B0&keyword_channel=user" target="_blank" rel="noopener noreferrer">
                            모든 상품 보기 <span className="arrow">&gt;</span>
                        </a>
                    </div>
                </div>
            )}






            {/* 👇 상세 이미지 탭 */}
            <div className="store-detail-top-wrapper">

                {/* <h2 className="section-title">가게 상세 이미지</h2> */}

                {/* 탭 버튼들 */}
                <div className="tab-buttons">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 탭별 이미지 리스트 */}
                <div className="store-images">
                    {tabImages.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#999' }}>등록된 이미지가 없습니다.</p>
                    ) : (
                        tabImages.map((url, idx) => (
                            <img
                                key={url}
                                src={url}
                                alt={`${storeName} ${activeTab} 이미지 ${idx + 1}`}
                                className="store-tab-image"
                                onClick={() => handleImageClick(url)} // ✅ 클릭 이벤트 추가
                            />
                        ))
                    )}

                </div>
                {/* ✅ 모달 */}
                {selectedImage && (
                    <div className="image-modal-overlay" onClick={handleCloseModal}>
                        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                            <img src={selectedImage} alt="확대 이미지" />
                            <button className="image-modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                    </div>
                )}

            </div>



            <div className="store-review-wrapper">

                <div className='review-item'>
                    <img src='/img/icon/리뷰쓰기.svg' alt="리뷰제목" />
                    <span>리뷰</span>
                </div>

                {storeReviews.length > 0 ? (
                    // 리뷰가 있을 때
                    <div className="store-review-list">
                        {storeReviews.map((review, idx) => {
                            const comments = reviewComments[review.id] || [];
                            const likeCount = review.likes?.length || 0;

                            return (
                                <div className="store-review-card" key={idx}>

                                    <div className="review-content">
                                        <p>{review.content}</p>
                                    </div>


                                    <div className="review-header">
                                        <div className="review-stars">
                                            {[...Array(5)].map((_, i) => {
                                                const value = i + 1;
                                                let src =
                                                    review.star >= value
                                                        ? "/img/icon/단골등록해제.svg"
                                                        : review.star + 0.5 >= value
                                                            ? "/img/icon/반쪽자리별.svg"
                                                            : "/img/icon/단골등록.svg";
                                                return <img key={i} src={src} className="star-icon" alt="별" />;
                                            })}
                                            <span className="review-star-value">{(review.star ?? 0).toFixed(1)}점</span>
                                        </div>
                                    </div>


                                    <div className="review-footer">
                                        <div className="review-icons">
                                            <img src="/img/icon/좋아용.svg" alt="좋아요" />
                                            <span>{likeCount}</span>
                                            <img
                                                src={
                                                    comments.length > 0
                                                        ? "/img/icon/댓글있음.svg"
                                                        : "/img/icon/댓글.svg"
                                                }
                                                alt="댓글"
                                            />
                                            <span>{comments.length}</span>
                                        </div>
                                        <div className="review-meta">
                                            <span className="review-nickname">{review.nickname}</span>
                                            <span className="review-date">
                                                {review.createdAt?.toDate().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>


                                </div>
                            );
                        })}
                    </div>


                ) : (
                    // 리뷰가 하나도 없을 때 이거 보여줘야지!
                    <p className="no-store-review">아직 등록된 리뷰가 없습니다. 첫 리뷰를 남겨보세요!</p>
                )}

                <div className="review-link-wrapper">
                    <a
                        href={`https://search.naver.com/search.naver?query=${encodeURIComponent(storeName)} 리뷰`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="naver-review-link"
                    >
                        네이버 리뷰 보러가기
                    </a>

                    <a
                        href={`/review/`}
                        className="review-more-link"
                    >
                        리뷰 더보기
                    </a>


                </div>


            </div>
        </div >
    )
}
