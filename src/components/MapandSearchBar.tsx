import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { storeData } from '../data/storeData';
import './Mapgallery.css'
import { useNavigate } from 'react-router-dom';

import { db } from "../firebase"
import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore"


export default function MapandSearchBar() {
    const [selectedStore, setSelectedStore] = useState<typeof storeData[0] | null>(null)
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStores, setFilteredStores] = useState(storeData);
    const [showMap, setShowMap] = useState(true)
    const mapRef = useRef(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null)

    const navigate = useNavigate();



    const getStoreRatingData = async (storeId: string) => {
        const q = query(
            collection(db, "reviews"),
            where("storeId", "==", storeId)
        )
        const snapshot = await getDocs(q)
        const reviews = snapshot.docs.map(doc => doc.data())
        const total = reviews.reduce((acc, r) => acc + (r.star || 0), 0)
        const average = reviews.length ? total / reviews.length : 0
        return {
            average: Number(average.toFixed(1)),
            count: reviews.length
        }
    }

    // 리뷰
    const [storeRatings, setStoreRatings] = useState<{
        [key: string]: { average: number; count: number }
    }>({})

    useEffect(() => {
        const fetchAllRatings = async () => {
            const result: any = {}
            for (let i = 0; i < storeData.length; i++) {
                const storeId = `store${i + 1}`  // ✅ 이렇게 파싱!
                const rating = await getStoreRatingData(storeId)
                result[storeId] = rating
            }
            setStoreRatings(result)
        }

        fetchAllRatings()
    }, [])



    useEffect(() => {
        if (!showMap || !mapContainerRef.current) return

        const container = mapContainerRef.current

        const initializeMap = () => {
            const map = new window.kakao.maps.Map(container, {
                center: new window.kakao.maps.LatLng(35.413, 128.123),
                level: 4
            });

            mapRef.current = map;

            setTimeout(() => {
                window.kakao.maps.event.trigger(map, 'resize');
            }, 200);

            filteredStores.forEach((store) => {
                const position = new window.kakao.maps.LatLng(store.lat, store.lng);

                const marker = new window.kakao.maps.Marker({
                    position,
                    map,
                    title: store.name
                });

                window.kakao.maps.event.addListener(marker, 'click', () => {
                    setSelectedStore(store);
                    map.setLevel(1);
                    map.panTo(position);
                });

                const overlayContent = document.createElement('div');
                overlayContent.innerText = store.name;
                overlayContent.style.cssText = `
              cursor: pointer;
              padding: 6px 14px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              font-size: 13px;
              font-weight: 500;
              color: #333;
              white-space: nowrap;
              border: 1px solid #ddd;
            `;
                overlayContent.onclick = () => setSelectedStore(store);

                const overlay = new window.kakao.maps.CustomOverlay({
                    position,
                    content: overlayContent,
                    yAnchor: 1.5
                });

                overlay.setMap(map);
            });

            if (filteredStores.length === 1) {
                const target = filteredStores[0];
                map.setCenter(new window.kakao.maps.LatLng(target.lat, target.lng));
                map.setLevel(3);
            }
        };

        const loadKakaoMap = () => {
            if (!window.kakao || !window.kakao.maps) {
                const script = document.createElement("script");
                script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=d65716a4db9e8a93aaff1dfc09ee36b8`;
                script.onload = () => window.kakao.maps.load(initializeMap);
                document.head.appendChild(script);
            } else {
                window.kakao.maps.load(initializeMap);
            }
        };

        loadKakaoMap();
    }, [showMap, filteredStores]);


    return (
        <div>

            <div className="map-gallery-searchbar">
                <button
                    className="search-icon-button"
                    onClick={() => {
                        if (searchQuery.trim() === '') {
                            setFilteredStores(storeData)
                            setSelectedStore(null)
                        } else {
                            const results = storeData.filter(store =>
                                store.name.includes(searchQuery)
                            )
                            setFilteredStores(results)
                            setSelectedStore(results[0] ?? null)
                        }
                    }}
                >
                    <img src="/img/logo/search.svg" alt="검색 아이콘" className="search-icon-img" />
                </button>
                <input
                    type="text"
                    value={searchQuery}
                    placeholder="내가 찾는 식당을 검색해보세요."
                    onFocus={() => setShowMap(true)}
                    onChange={(e) => {
                        const keyword = e.target.value
                        setSearchQuery(keyword)

                        if (keyword.trim() === '') {
                            setFilteredStores(storeData)
                            setSelectedStore(null)
                        } else {
                            const results = storeData.filter(store =>
                                store.name.includes(keyword)
                            )
                            setFilteredStores(results)
                            setSelectedStore(results[0] ?? null)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const results = storeData.filter(store =>
                                store.name.includes(searchQuery)
                            )
                            setFilteredStores(results)
                            setSelectedStore(results[0] ?? null)
                        }
                    }}
                />
            </div>



            {/* 지도 */}
            {showMap && (
                <div className="map-gallery-map-container">

                    {/* ✅ 지도 위에 겹쳐진 정보 카드 */}
                    {selectedStore && (() => {
                        const storeIndex = storeData.findIndex(s => s.name === selectedStore.name)
                        if (storeIndex === -1) return null;
                        const storeId = `store${storeIndex + 1}`
                        const rating = storeRatings[storeId]

                        return (
                            <div className="map-gallery-info-card">

                                {/* ⬇️ 가게명 + 별점 + 메뉴링크 한 줄 정렬 */}
                                <div className="info-header">
                                    <h3 className="store-name">
                                        {selectedStore.name}
                                        <span className="rating">
                                            {[...Array(5)].map((_, i) => {
                                                const value = i + 1
                                                let imgSrc = ""

                                                if (rating?.average >= value) {
                                                    imgSrc = "/img/icon/단골등록해제.svg"
                                                } else if (rating?.average + 0.5 >= value) {
                                                    imgSrc = "/img/icon/반쪽자리별.svg"
                                                } else {
                                                    imgSrc = "/img/icon/단골등록.svg"
                                                }

                                                return (
                                                    <img
                                                        key={i}
                                                        src={imgSrc}
                                                        alt="별점"
                                                        className="star-icon"
                                                        style={{ width: 16, height: 16 }}
                                                    />
                                                )
                                            })}
                                            <span className="review-score">{rating?.average?.toFixed(1) || "0.0"}점</span>
                                            <span className="review-count">({rating?.count || 0}개 리뷰)</span>
                                        </span>
                                    </h3>

                                    <div className="menu-links">
                                        <div className="link" onClick={() => navigate("/review")}>Review</div>
                                        <span className="divider">|</span>
                                        <div className="link" onClick={() => navigate(`/store/${encodeURIComponent(selectedStore.name)}`)}>상세페이지 바로가기</div>
                                    </div>

                                </div>

                                <div className="store-detail">
                                    <div className="store-address">
                                        <span className="label">주소 :</span> {selectedStore.address}
                                        <a
                                            href={`https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="map-link"
                                        >
                                            길찾기
                                        </a>
                                    </div>
                                </div>


                                <div className='store-detail'>
                                    <span className="phone-text">전화번호 : {selectedStore.phone}</span>
                                    <a href={`tel:${selectedStore.phone.replace(/[^0-9]/g, '')}`} className="call-icon" aria-label="전화 걸기">
                                        <img src="/img/icon/call.svg" alt="전화 아이콘" />
                                    </a>
                                </div>

                                <p className="store-detail">
                                    <span className="label">영업시간 :</span> {selectedStore.hours.split('/')[0]}
                                    {selectedStore.point && (
                                        <span className="point"> ※ {selectedStore.point}</span>
                                    )}
                                </p>

                                <p className="store-detail">
                                    <span className="label">휴무 :</span> {selectedStore.hours.split('/')[1].replace('휴무', '')}
                                </p>



                                {/* <div className="subpage-links">
                          <button
                            className="sub-link"
                            onClick={() => navigate(`/store/${encodeURIComponent(selectedStore.name)}`)}
                          >
                            상세페이지로 가기
                          </button>
                        </div> */}

                            </div>
                        )
                    })()}


                    {/* ✅ 실제 지도 div */}
                    <div id="map" ref={mapContainerRef} />




                </div>
            )}
        </div>

    )

}