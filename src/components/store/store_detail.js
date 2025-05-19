import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storeData } from '../../data/storeData';
import './storeDetail.css';
import { storeDetailAssets } from '../../data/storeDetailAssets';
import { doc, setDoc, deleteDoc, getDoc, query, collection, where, getDocs, } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from 'react-router-dom';
const tabs = ['가게메뉴', '상차림', '편의시설'];
export default function StoreDetail() {
    const { name } = useParams();
    const storeName = decodeURIComponent(name || '');
    const selectedStore = storeData.find((s) => s.name === storeName);
    const [activeTab, setActiveTab] = useState('가게메뉴');
    const [showAllFacilities, setShowAllFacilities] = useState(false);
    const titles = storeDetailAssets[selectedStore.name] || [];
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const storeId = `store${storeData.indexOf(selectedStore) + 1}`;
    const [storeRatings, setStoreRatings] = useState({});
    const storeIndex = storeData.findIndex(s => s.name === selectedStore.name);
    const average = storeRatings[storeId]?.average || 0;
    //  별
    const getStoreRatingData = async (storeId) => {
        const q = query(collection(db, "reviews"), where("storeId", "==", storeId));
        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => doc.data());
        const count = reviews.length;
        const total = reviews.reduce((sum, r) => sum + (r.star || 0), 0);
        const average = count ? total / count : 0;
        return { average, count };
    };
    useEffect(() => {
        const fetchRating = async () => {
            if (!selectedStore)
                return;
            const storeIndex = storeData.findIndex(s => s.name === selectedStore.name);
            if (storeIndex === -1)
                return;
            const storeId = `store${storeIndex + 1}`;
            const rating = await getStoreRatingData(storeId);
            setStoreRatings(prev => ({ ...prev, [storeId]: rating }));
        };
        fetchRating();
    }, [selectedStore]);
    // 리뷰
    const [storeReviews, setStoreReviews] = useState([]);
    useEffect(() => {
        const fetchStoreReviews = async () => {
            const storeId = `store${storeData.findIndex(s => s.name === selectedStore.name) + 1}`;
            const q = query(collection(db, 'reviews'), where('storeId', '==', storeId));
            const snapshot = await getDocs(q);
            const reviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // ⭐️ 별점 5점짜리만 추려서 최신순 정렬 후 3개만
            const filtered = reviews
                .filter(r => r.star === 5)
                .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
                .slice(0, 3);
            setStoreReviews(filtered);
        };
        fetchStoreReviews();
    }, [selectedStore]);
    // 댓글
    const [reviewComments, setReviewComments] = useState({});
    useEffect(() => {
        const fetchAllComments = async () => {
            const newComments = {};
            for (const review of storeReviews) {
                const snap = await getDocs(collection(db, "reviews", review.id, "comments"));
                newComments[review.id] = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }
            setReviewComments(newComments);
        };
        if (storeReviews.length > 0) {
            fetchAllComments();
        }
    }, [storeReviews]);
    const facilityIcons = {
        '주문배송': '/SAMGA-V2/img/amenities/주문배송.svg',
        '무료wifi': '/SAMGA-V2/img/amenities/무료wifi.svg',
        '남여화장실구분': '/SAMGA-V2/img/amenities/남여화장실구분.svg',
        '단체이용예약가능': '/SAMGA-V2/img/amenities/단체이용예약가능.svg',
        '예약가능': '/SAMGA-V2/img/amenities/예약가능.svg',
        '주차장': '/SAMGA-V2/img/amenities/주차장.svg',
        '제로페이': '/SAMGA-V2/img/amenities/제로페이.svg',
        '유아의자': '/SAMGA-V2/img/amenities/유아의자.svg',
        '포장가능': '/SAMGA-V2/img/amenities/포장가능.svg',
        '일반식사메뉴': '/SAMGA-V2/img/amenities/일반식사메뉴.svg',
    };
    const tabToFolderMap = {
        '가게메뉴': 'menu',
        '상차림': 'side',
        '편의시설': 'amenities',
    };
    const currentFolder = tabToFolderMap[activeTab];
    const MAX_IMAGES = 10;
    const imageCandidates = Array.from({ length: MAX_IMAGES }, (_, i) => `${storeName}_${i + 1}`);
    if (!selectedStore)
        return _jsx("div", { children: "\uAC00\uAC8C \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
    useEffect(() => {
        const checkFavorite = async () => {
            const user = auth.currentUser;
            if (!user || !storeId)
                return;
            const ref = doc(db, "favorites", storeId, "users", user.uid);
            const snap = await getDoc(ref);
            setIsFavorite(snap.exists());
        };
        checkFavorite();
    }, [storeId]);
    const handleToggle = async () => {
        const user = auth.currentUser;
        if (!user)
            return alert("로그인 후 이용해주세요.");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists())
            return alert("유저 정보가 없습니다.");
        const { nickname, phone, email } = userDoc.data();
        const favRef = doc(db, "favorites", storeId, "users", user.uid);
        const favSnap = await getDoc(favRef);
        if (favSnap.exists()) {
            await deleteDoc(favRef);
            setIsFavorite(false);
            alert("단골이 해제되었습니다!");
        }
        else {
            await setDoc(favRef, {
                nickname,
                phone,
                email,
                createdAt: new Date()
            });
            setIsFavorite(true);
            alert("단골로 등록되었습니다!");
        }
    };
    // console.log(selectedStore.detailImagelist)
    return (_jsxs("div", { className: "store-detail-wrapper", children: [_jsx("div", { className: "store-hero-image", style: { backgroundImage: `url(${selectedStore.detailimage})` } }), _jsxs("div", { className: "store-info-card", children: [_jsxs("div", { className: "store-name-stars", children: [_jsx("h2", { className: "store-name", children: selectedStore.name }), _jsxs("div", { className: "star-icons", children: [[...Array(5)].map((_, i) => {
                                        const value = i + 1;
                                        let src = '';
                                        if (average >= value) {
                                            src = '/SAMGA-V2/img/icon/단골등록해제.svg'; // 가득 찬 별
                                        }
                                        else if (average + 0.5 >= value) {
                                            src = '/SAMGA-V2/img/icon/반쪽자리별.svg'; // 반쪽 별
                                        }
                                        else {
                                            src = '/SAMGA-V2/img/icon/단골등록.svg'; // 빈 별
                                        }
                                        return _jsx("img", { src: src, alt: "\uBCC4", style: { width: '18px', height: '18px', marginRight: '2px' } }, i);
                                    }), _jsxs("span", { style: { marginLeft: '6px', fontSize: '14px', color: '#444' }, children: [average.toFixed(1), "\uC810"] })] })] }), _jsxs("div", { className: "store-detail", children: [_jsx("span", { className: "label", children: "\uC601\uC5C5\uC2DC\uAC04 :" }), " ", selectedStore.hours.split('/')[0], selectedStore.point && (_jsxs("span", { className: "point", children: [" \u203B ", selectedStore.point] }))] }), _jsxs("div", { className: "store-detail", children: [_jsx("span", { className: "label", children: "\uD734\uBB34 :" }), " ", selectedStore.hours.split('/')[1].replace('휴무', '')] }), _jsxs("div", { className: "store-actions", children: [_jsx("div", { className: "action-item", children: _jsxs("a", { href: `https://map.kakao.com/?q=${encodeURIComponent(selectedStore.name)}`, target: "_blank", rel: "noopener noreferrer", children: [_jsx("img", { src: "/SAMGA-V2/img/icon/\uAE38\uCC3E\uAE30.svg", alt: "\uAE38\uCC3E\uAE30" }), _jsx("span", { children: "\uAE38\uCC3E\uAE30" })] }) }), _jsxs("div", { className: "action-item", children: [_jsx("img", { src: "/SAMGA-V2/img/icon/\uACF5\uC720\uD558\uAE30.svg", alt: "\uACF5\uC720\uD558\uAE30" }), _jsx("span", { children: "\uACF5\uC720\uD558\uAE30" })] }), _jsxs("div", { className: "action-item", onClick: handleToggle, children: [_jsx("img", { src: isFavorite
                                            ? "/SAMGA-V2/img/icon/단골등록해제.svg"
                                            : "/SAMGA-V2/img/icon/단골등록.svg", alt: isFavorite ? "단골해제" : "단골등록" }), _jsx("span", { children: isFavorite ? "단골해제" : "단골등록" })] }), _jsxs("div", { className: "action-item", children: [_jsx("img", { src: "/SAMGA-V2/img/icon/\uB9AC\uBDF0\uC4F0\uAE30.svg", alt: "\uB9AC\uBDF0\uC4F0\uAE30" }), _jsx("span", { onClick: () => navigate('/write'), children: "\uB9AC\uBDF0\uC4F0\uAE30" })] })] }), _jsxs("div", { className: "facility-section", children: [_jsx("div", { className: "facility-title", children: "\uD3B8\uC758\uC2DC\uC124" }), _jsx("div", { className: "facility-icons", children: (showAllFacilities ? selectedStore.options : selectedStore.options.slice(0, 4)).map(option => (facilityIcons[option] && (_jsxs("div", { className: "facility-icon", children: [_jsx("div", { className: `facility-icon-img-wrapper ${option === "무료wifi" ? "wifi-padding" : ""}`, children: _jsx("img", { src: facilityIcons[option], alt: option }) }), _jsx("p", { children: option })] }, option)))) }), _jsx("div", { className: "button-location", children: selectedStore.options.length > 4 && (_jsx("button", { className: "more-button", onClick: () => setShowAllFacilities(prev => !prev), children: showAllFacilities
                                        ? '간략히 보기 ▲'
                                        : `+${selectedStore.options.length - 4}개 더보기 ▼` })) })] })] }), _jsxs("div", { className: `store-story-wrapper ${selectedStore.name === "대가한우" ? "no-bg" : ""}`, children: [_jsx("div", { className: "store-slogan", children: selectedStore.description.split('\n').map((line, i) => (_jsx("div", { children: line }, i))) }), _jsxs("div", { className: `store-name-line ${selectedStore.name === '대가1호점' ? 'extra-padding' : ''}`, children: [_jsx("span", { className: "store-name-text", children: selectedStore.name }), _jsx("div", { className: "store-name-bar" })] })] }), _jsx("div", { className: "brand-inner", children: _jsxs("div", { className: `store-brand-wrapper ${selectedStore.name === "대가한우" ? "no-bg" : ""}`, children: [_jsx("img", { src: "/SAMGA-V2/img/logo/videologo.svg", alt: "videologo", className: "video-logo" }), _jsx("div", { className: "brand-text", children: "KOREAN BEEF VILLAGE SAMGA" }), _jsx("hr", { className: "brand-divider" })] }) }), _jsxs("div", { className: "store-detail-images-separated", children: [_jsx("div", { className: "detail-images-pc only-pc", children: selectedStore.detailImagelist
                            .filter((src) => /상세페이지_PC_\d+\.(jpg|png)$/i.test(src))
                            .map((src, idx) => (_jsxs("div", { className: "pc-image-wrapper", children: [_jsx("img", { src: src, alt: `PC 상세 이미지 ${idx + 1}`, className: "store-image" }), titles[idx] && (_jsx("div", { className: `pc-image-text-overlay ${titles[idx].className}`, children: titles[idx].text.split("\n").map((line, i) => {
                                        const isDeawoong2 = titles[idx].className === "deawoong2";
                                        // ✅ 두 번째 줄: '는'만 하이라이트
                                        if (isDeawoong2 && i === 1) {
                                            const body = line.slice(0, -1);
                                            const last = line.slice(-1);
                                            return (_jsxs("div", { children: [body, _jsx("span", { className: "highlight", children: last })] }, i));
                                        }
                                        // ✅ 세 번째 줄: 전체 하이라이트
                                        if (isDeawoong2 && i === 2) {
                                            return (_jsx("div", { className: "highlight", children: line }, i));
                                        }
                                        return _jsx("div", { children: line }, i);
                                    }) }))] }, `pc-${idx}`))) }), _jsx("div", { className: "detail-images-mobile only-mobile", children: selectedStore.detailImagelist
                            .filter((src) => /상세페이지_M_\d+\.(jpg|png)$/i.test(src))
                            .map((src, idx) => (_jsx("img", { src: src, alt: `모바일 상세 이미지 ${idx + 1}`, className: "store-image" }, `m-${idx}`))) })] }), selectedStore.name === "도원식육식당" && (_jsxs("div", { className: "dowon-product-section", children: [_jsxs("div", { className: "dowon-product-inner", children: [_jsxs("div", { className: "dowon-product-title", children: ["\uC544\uC774\uB514\uC5B4\uC2A4 \uC778\uAE30\uC81C\uD488 ", _jsx("span", { className: "highlight", children: "\uAD6C\uB9E4\uD558\uAE30" })] }), _jsxs("div", { className: "dowon-product-grid dowon-only-pc", children: [_jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/25792545-088d-4d5c-bb89-762a3b6533b0?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/1.png", alt: "1\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "\uD55C\uC6B0(\uB300\uD328)\uB85C\uC2A4\uAD6C\uC774(2-3\uC778)" })] }) }), _jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/d0e10218-942c-4664-b1b3-0c6c770c9e7e?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/2.png", alt: "2\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "\uD55C\uC6B0(\uB9CC\uB2A5)\uC790\uD22C\uB9AC1\uD0A4\uB85C" })] }) }), _jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/1953a42a-00ca-4418-af1b-576b2876e7f5?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/3.png", alt: "3\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "(\uB208\uAF43)(1++9)\uD55C\uC6B0 \uB4F1\uC2EC(300G)" })] }) }), _jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/4ee9f37c-16ff-4457-aab2-e823035a4b4d?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/4.png", alt: "4\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "(\uAD6D\uB0B4\uC0B0)\uB3FC\uC9C0 \uAC08\uBE44\uCC1C" })] }) }), _jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/bd28e21e-e78c-4296-ae61-1f48da56bbe2?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/5.png", alt: "5\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "(\uBA85\uD488\uD55C\uC6B0\uC120\uBB3C)\uD55C\uC6B0\uD2B9\uBAA8\uB4EC0.6KG" })] }) })] }), _jsxs("div", { className: "dowon-product-grid dowon-only-mobile", children: [_jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/25792545-088d-4d5c-bb89-762a3b6533b0?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/1.png", alt: "1\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "\uD55C\uC6B0(\uB300\uD328)\uB85C\uC2A4\uAD6C\uC774(2-3\uC778)" })] }) }), _jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/d0e10218-942c-4664-b1b3-0c6c770c9e7e?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/2.png", alt: "2\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "\uD55C\uC6B0(\uB9CC\uB2A5)\uC790\uD22C\uB9AC1\uD0A4\uB85C" })] }) }), _jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/1953a42a-00ca-4418-af1b-576b2876e7f5?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/3.png", alt: "3\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "(\uB208\uAF43)(1++9)\uD55C\uC6B0 \uB4F1\uC2EC(300G)" })] }) }), _jsx("div", { className: "dowon-product-item", children: _jsxs("a", { target: "_blank", rel: "noopener noreferrer", href: "https://www.idus.com/v2/product/4ee9f37c-16ff-4457-aab2-e823035a4b4d?search_word=%EB%8F%84%EC%9B%90+%ED%95%9C%EC%9A%B0&keyword_channel=user", children: [_jsx("img", { src: "/SAMGA-V2/samga/store/dowon/4.png", alt: "4\uBC88 \uC0C1\uD488" }), _jsx("div", { className: "dowon-product-name", children: "(\uAD6D\uB0B4\uC0B0)\uB3FC\uC9C0 \uAC08\uBE44\uCC1C" })] }) })] })] }), _jsx("div", { className: "idius-all", children: _jsxs("a", { href: "https://www.idus.com/v2/search?keyword=%EB%8F%84%EC%9B%90%20%ED%95%9C%EC%9A%B0&keyword_channel=user", target: "_blank", rel: "noopener noreferrer", children: ["\uBAA8\uB4E0 \uC0C1\uD488 \uBCF4\uAE30 ", _jsx("span", { className: "arrow", children: ">" })] }) })] })), _jsxs("div", { className: "store-detail-top-wrapper", children: [_jsx("h2", { className: "section-title", children: "\uAC00\uAC8C \uC0C1\uC138 \uC774\uBBF8\uC9C0" }), _jsx("div", { className: "tab-buttons", children: tabs.map(tab => (_jsx("button", { className: `tab-button ${activeTab === tab ? 'active' : ''}`, onClick: () => setActiveTab(tab), children: tab }, tab))) }), _jsx("div", { className: "store-images", children: imageCandidates.map((name, idx) => (['.jpg', '.JPG', '.png'].map((ext) => {
                            const src = `/SAMGA-V2/samga/store/${currentFolder}/${name}${ext}`;
                            return (_jsx("img", { src: src, alt: `${storeName} ${activeTab} 이미지 ${idx + 1}`, className: "store-image", onError: (e) => {
                                    e.target.style.display = 'none';
                                } }, src));
                        }))) })] }), _jsxs("div", { className: "store-review-wrapper", children: [_jsxs("div", { className: 'review-item', children: [_jsx("img", { src: '/SAMGA-V2/img/icon/\uB9AC\uBDF0\uC4F0\uAE30.svg', alt: "\uB9AC\uBDF0\uC81C\uBAA9" }), _jsx("span", { children: "\uB9AC\uBDF0" })] }), storeReviews.length > 0 ? (
                    // 리뷰가 있을 때
                    _jsx("div", { className: "store-review-list", children: storeReviews.map((review, idx) => {
                            const comments = reviewComments[review.id] || [];
                            const likeCount = review.likes?.length || 0;
                            return (_jsxs("div", { className: "store-review-card", children: [_jsx("div", { className: "review-content", children: _jsx("p", { children: review.content }) }), _jsx("div", { className: "review-header", children: _jsxs("div", { className: "review-stars", children: [[...Array(5)].map((_, i) => {
                                                    const value = i + 1;
                                                    let src = review.star >= value
                                                        ? "/SAMGA-V2/img/icon/단골등록해제.svg"
                                                        : review.star + 0.5 >= value
                                                            ? "/SAMGA-V2/img/icon/반쪽자리별.svg"
                                                            : "/SAMGA-V2/img/icon/단골등록.svg";
                                                    return _jsx("img", { src: src, className: "star-icon", alt: "\uBCC4" }, i);
                                                }), _jsxs("span", { className: "review-star-value", children: [(review.star ?? 0).toFixed(1), "\uC810"] })] }) }), _jsxs("div", { className: "review-footer", children: [_jsxs("div", { className: "review-icons", children: [_jsx("img", { src: "/SAMGA-V2/img/icon/\uC88B\uC544\uC6A9.svg", alt: "\uC88B\uC544\uC694" }), _jsx("span", { children: likeCount }), _jsx("img", { src: comments.length > 0
                                                            ? "/SAMGA-V2/img/icon/댓글있음.svg"
                                                            : "/SAMGA-V2/img/icon/댓글.svg", alt: "\uB313\uAE00" }), _jsx("span", { children: comments.length })] }), _jsxs("div", { className: "review-meta", children: [_jsx("span", { className: "review-nickname", children: review.nickname }), _jsx("span", { className: "review-date", children: review.createdAt?.toDate().toLocaleString() })] })] })] }, idx));
                        }) })) : (
                    // 리뷰가 하나도 없을 때 이거 보여줘야지!
                    _jsx("p", { className: "no-store-review", children: "\uC544\uC9C1 \uB4F1\uB85D\uB41C \uB9AC\uBDF0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uCCAB \uB9AC\uBDF0\uB97C \uB0A8\uACA8\uBCF4\uC138\uC694!" })), _jsxs("div", { className: "review-link-wrapper", children: [_jsx("a", { href: `https://search.naver.com/search.naver?query=${encodeURIComponent(storeName)} 리뷰`, target: "_blank", rel: "noopener noreferrer", className: "naver-review-link", children: "\uB124\uC774\uBC84 \uB9AC\uBDF0 \uBCF4\uB7EC\uAC00\uAE30" }), _jsx("a", { href: `/review/`, className: "review-more-link", children: "\uB9AC\uBDF0 \uB354\uBCF4\uAE30" })] })] })] }));
}
