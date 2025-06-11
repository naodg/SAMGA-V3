// PC 버전은 그대로 유지하고, 모바일에서 가게 리스트 누락 및 지도 렌더링 문제 해결
// 모바일에서 지도 ID 중복 사용으로 생긴 문제 해결, 지도는 따로 렌더링되도록 분리

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeData, Store } from '../data/storeData';

import { db } from "../firebase"
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore"

import './storefilterpage.css'

const filters = [
  { label: '주차장', key: '주차장' },
  { label: '예약 가능', key: '예약가능' },
  { label: '무료 WIFI', key: '무료wifi' },
  { label: '일반 식사 메뉴', key: '일반식사메뉴' },
  { label: '유아의자', key: '유아의자' },
  { label: '남여 화장실 구분', key: '남여화장실구분' },
  { label: '단체 이용.예약 가능', key: '단체이용예약가능' },
  { label: '주문 배송', key: '주문배송' },
  { label: '포장가능', key: '포장가능' },
  { label: '제로페이', key: '제로페이' },
];

export default function StoreFilterPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const isMobile = window.innerWidth <= 1200;
  const [showMap, setShowMap] = useState(!isMobile ? true : false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
  const navigate = useNavigate();


  // 예약하기

  const [selectedAction, setSelectedAction] = useState<"call" | "message" | null>(null);
  const [messageText, setMessageText] = useState<string>("");
  const popupRef = useRef<HTMLDivElement>(null);
  const [triggeredFromReservation, setTriggeredFromReservation] = useState(false);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        setSelectedStore(null);
        setSelectedAction(null);
        setMessageText("");
      }
    };

    if (selectedStore) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedStore]);


  const reservableStores = [
    "대가식육식당",
    "대가한우",
    "대산식육식당",
    "대웅식육식당",
    "태영한우",
  ];

  const handleClose = () => {
    setSelectedStore(null);
    setSelectedAction(null);
    setMessageText("");
    setTriggeredFromReservation(false);
  };

  // ----------------------------------------------------


  const mapId = isMobile ? 'mobileMap' : 'filterMap';
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);


  const [paddingSize, setPaddingSize] = useState('120px');

  const [openOptions, setOpenOptions] = useState<{ [storeName: string]: boolean }>({});

  // ✅ 먼저 상태 추가
  const [searchQuery, setSearchQuery] = useState('');


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


  useEffect(() => {
    const updatePadding = () => {
      const width = window.innerWidth;
      if (width <= 1600) {
        setPaddingSize('0px'); // 태블릿: 양쪽 40px
      } else {
        setPaddingSize('120px'); // 데스크탑: 양쪽 120px
      }
    };

    updatePadding(); // 처음 실행
    window.addEventListener('resize', updatePadding); // 리사이즈 때마다 실행

    return () => window.removeEventListener('resize', updatePadding);
  }, []);



  useEffect(() => {
    const stores = activeFilters.length === 0
      ? storeData
      : storeData.filter(store =>
        activeFilters.every(filterKey => store.options?.includes(filterKey))
      );
    setFilteredStores(stores);
  }, [activeFilters]);


  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=d8e76007c8b0148a086c37901f73bd54`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById(mapId);
        if (!container) return;
        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(35.413, 128.123),
          level: 4
        });
        mapRef.current = map;

        // ✅ showMap이 true일 때만 초기 마커 렌더링
        if (showMap) {
          const markersToShow =
            searchQuery.trim() === ''
              ? (activeFilters.length === 0 ? storeData : filteredStores)
              : filteredStores;

          updateMarkers(markersToShow);
          setTimeout(() => {
            window.kakao.maps.event.trigger(map, 'resize');
          }, 200);
        }
      });
    };
    document.head.appendChild(script);
  }, []); // ✅ filteredStores 제거!

  useEffect(() => {
    if (!showMap || !mapRef.current) return;

    const markersToShow =
      searchQuery.trim() === ''
        ? (activeFilters.length === 0 ? storeData : filteredStores)
        : filteredStores;

    updateMarkers(markersToShow);

    setTimeout(() => {
      window.kakao.maps.event.trigger(mapRef.current, 'resize');
    }, 200);
  }, [showMap, filteredStores, searchQuery]);



  const updateMarkers = (stores: Store[]) => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(marker => marker.setMap(null));
    overlaysRef.current.forEach(overlay => overlay.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    stores.forEach(store => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lng);
      const marker = new window.kakao.maps.Marker({ position, map });
      markersRef.current.push(marker);

      const contentDiv = document.createElement('div');
      contentDiv.innerText = store.name;
      // ✅ 클릭 이벤트를 등록할 때 함수로 selectedStore를 직접 체크하게 만든다
      contentDiv.addEventListener('click', () => {
        setSelectedStore(prevSelected => {
          if (prevSelected?.name === store.name) {
            return null; // 같으면 닫기
          } else {
            return store; // 다르면 열기
          }
        });
      });
      contentDiv.style.cssText = `padding:6px 12px; background:white; border-radius:8px; font-size:13px; font-weight:bold; color:#333; box-shadow:0 2px 6px rgba(0,0,0,0.2); border:1px solid #ddd; white-space:nowrap; cursor:pointer; text-align:center;`;

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: contentDiv,
        yAnchor: 1.5
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });
  };

  const toggleFilter = (key: string) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };


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




  return (
    <div>
      {isMobile ? (
        <>
          {/* ✅ 1. 검색바 (최상단) */}
          <div className="mobile-search-wrapper">
            <div className="mobile-search-bar">
              <button className="mobile-search-icon-button" onClick={() => {
                if (searchQuery.trim() === '') {
                  setFilteredStores(storeData);
                  setSelectedStore(null);
                } else {
                  const results = storeData.filter(store =>
                    store.name.includes(searchQuery)
                  );
                  setFilteredStores(results);
                  setSelectedStore(results[0] ?? null);
                }
              }}>
                <img src="/img/logo/search.svg" alt="검색 아이콘" />
              </button>

              <input
                type="text"
                value={searchQuery}
                className="search-input"
                placeholder="내가 찾는 식당을 검색해보세요."
                onFocus={() => {
                  setShowMap(true);
                  // setTimeout(() => {
                  //   updateMarkers(storeData); 
                  // }, 100); 
                }}
                onChange={(e) => {
                  const keyword = e.target.value;
                  setSearchQuery(keyword);
                  if (keyword.trim() === '') {
                    setFilteredStores(storeData);
                    setSelectedStore(null);
                    updateMarkers(storeData);
                  } else {
                    const results = storeData.filter(store =>
                      store.name.includes(keyword)
                    );
                    setFilteredStores(results);
                    setSelectedStore(results[0] ?? null);
                    updateMarkers(results);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const results = storeData.filter(store =>
                      store.name.includes(searchQuery)
                    );
                    setFilteredStores(results);
                    setSelectedStore(results[0] ?? null);
                  }
                }}
              />
            </div>
          </div>

          {/* ✅ 2. 필터 버튼 */}
          <div className={`mobile-filter-bar ${isFilterExpanded ? 'expanded' : ''}`}>

            <button onClick={() => setShowMap(!showMap)} className="toggle-map-button">
              <img src='/img/icon/map.svg' width="15px" />
            </button>


            {/* 필터 버튼들 */}
            <div className="filter-button-group">


              {/* 필터 버튼 목록 (3개까지만 보여주고, 펼치면 전체 보여줌) */}
              {(isFilterExpanded ? filters : filters.slice(0, 4)).map(({ label, key }) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`mobile-filter-button ${activeFilters.includes(key) ? 'active' : ''}`}
                >
                  {label} {activeFilters.includes(key) && <span className="remove-x">×</span>}
                </button>
              ))}

            </div>

            {/* 필터 펼침 토글 버튼 (오른쪽 고정) */}

            {filters.length > 4 && (
              <button
                className="toggle-expand-button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFilterExpanded(prev => !prev)
                }}
              >
                <img
                  src={`/img/icon/${isFilterExpanded ? 'up' : 'down'}.svg`}
                  width="15px"
                  alt="펼침 토글"
                />
              </button>
            )}


          </div>

          {/* ✅ 3. 지도 표시 */}
          {showMap && (
            <div className="mobile-map-wrapper">
              <div id="mobileMap" className="mobile-map" />
              {selectedStore && (
                <div className="mobile-map-store-card">
                  <div className="store-card-header">
                    <h3>{selectedStore.name}</h3>
                    <button onClick={() => setShowMap(false)} className="close-button">✖</button>
                  </div>
                  <p className="store-address">{selectedStore.address}</p>
                  <p className="store-phone">{selectedStore.phone}</p>
                  <a
                    href={`https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    길찾기
                  </a>
                </div>
              )}
            </div>
          )}


          {/* ✅ 4. 가게 리스트 */}
          <div className="mobile-store-list">
            {filteredStores.map((store, index) => {
              const storeId = `store${index + 1}`
              const rating = storeRatings[storeId]

              return (
                <div
                  key={store.name}
                  className="mobile-store-item"
                  onClick={() => navigate(`/store/${encodeURIComponent(store.name)}`)}
                >
                  <div className="store-item-header">
                    <img
                      src={store.filterimage || '/img/default.jpg'}
                      alt={store.name}
                      className="m-store-thumbnail"
                    />
                    <div className="store-info-text">
                      <h3 className="fillter-store-name">{store.name}</h3>

                      {/* ⭐ 별점과 리뷰 수 반영 */}
                      <div className="rating-review">
                        <div className="store-stars">
                          {[...Array(5)].map((_, i) => {
                            const value = i + 1
                            let imgSrc = ""

                            if ((rating?.average ?? 0) >= value) {
                              imgSrc = "/img/icon/단골등록해제.svg" // 가득 찬 별
                            } else if ((rating?.average ?? 0) + 0.25 >= value) {
                              imgSrc = "/img/icon/반쪽자리별.svg" // 반쪽 별
                            } else {
                              imgSrc = "/img/icon/단골등록.svg" // 빈 별
                            }

                            return (
                              <img
                                key={i}
                                src={imgSrc}
                                alt="별"
                                className="star-icon"
                              />
                            )
                          })}
                          <span className="review-star-value">
                            {(rating?.average ?? 0).toFixed(1)}점
                          </span>
                        </div>
                        <span className="review-count">
                          ({rating?.count || 0} 리뷰)
                        </span>
                      </div>

                      <p className="store-address">{store.address}</p>
                      <p className="store-phone">{store.phone}</p>
                      {activeFilters.includes('예약가능') && store.options?.includes('예약가능') && (
                        <div
                          className="reservation-tag"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTriggeredFromReservation(true); // 문의 팝업용
                            setSelectedStore(store);
                            setSelectedAction(null);
                          }}
                        >
                          예약문의하기
                        </div>

                      )}
                    </div>
                  </div>

                  {store.options?.length > 0 && (
                    <div className="option-list">
                      {(openOptions[store.name] ? store.options : store.options.slice(0, 3)).map(opt => (
                        <span key={opt} className="option-tag">#{opt}</span>
                      ))}

                      {store.options.length > 3 && (
                        <button
                          className="toggle-options-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenOptions(prev => ({
                              ...prev,
                              [store.name]: !prev[store.name],
                            }))
                          }}
                        >
                          {openOptions[store.name] ? '간략히 ▲' : '더보기 ▼'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}


            {/* 팝업 카드 */}
            {selectedStore && !triggeredFromReservation && (
              <div className="popup-store-card">
                <div className="card-header">
                  <h3 className="filter-store-name">{selectedStore.name}</h3>
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="close-button"
                  >
                    ✖
                  </button>
                </div>
                <p className="store-address">{selectedStore.address}</p>
                <p className="store-phone">{selectedStore.phone}</p>
                <a
                  href={`https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="filter-map-link"
                >
                  길찾기
                </a>
              </div>
            )}

          </div>
        </>
      ) : (

        <>

          {/* ✅ PC 버전 전체 */}
          <div className="pc-wrapper">

            {/* ✅ 검색창 */}
            <div className="pc-search-wrapper">
              <div className="pc-search-bar">
                <button className="search-icon-button-fillter" onClick={() => {
                  if (searchQuery.trim() === '') {
                    setFilteredStores(storeData);
                    setSelectedStore(null);
                  } else {
                    const results = storeData.filter(store =>
                      store.name.includes(searchQuery)
                    );
                    setFilteredStores(results);
                    setSelectedStore(results[0] ?? null);
                  }
                }}>
                  <img src="/img/logo/search.svg" alt="검색 아이콘" />
                </button>

                <input
                  type="text"
                  value={searchQuery}
                  placeholder="내가 찾는 식당을 검색해보세요."
                  className="search-input"
                  onFocus={() => {
                    setShowMap(true);
                    // setTimeout(() => {
                    //   updateMarkers(storeData); 
                    // }, 100); 
                  }}
                  onChange={(e) => {
                    const keyword = e.target.value;
                    setSearchQuery(keyword);
                    if (keyword.trim() === '') {
                      setFilteredStores(storeData);
                      setSelectedStore(null);
                      updateMarkers(storeData);
                    } else {
                      const results = storeData.filter(store =>
                        store.name.includes(keyword)
                      );
                      setFilteredStores(results);
                      setSelectedStore(results[0] ?? null);
                      updateMarkers(results);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const results = storeData.filter(store =>
                        store.name.includes(searchQuery)
                      );
                      setFilteredStores(results);
                      setSelectedStore(results[0] ?? null);
                    }
                  }}
                />
              </div>
            </div>

            <hr className="search-divider" />

            {/* ✅ 필터 */}
            <div className="pc-filter-bar">
              <div className="filter-content">
                {filters.map(({ label, key }) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key)}
                    className={`filter-button ${activeFilters.includes(key) ? 'active' : ''}`}
                  >
                    {label} {activeFilters.includes(key) && <span className="remove-x">×</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ 본문: 가게 리스트 + 지도 */}
            <div className="pc-main-layout" >
              <div className="pc-store-list">
                {filteredStores.map((store, index) => {
                  const storeId = `store${index + 1}`
                  const rating = storeRatings[storeId]

                  return (
                    <div key={store.name} className="pc-store-item">

                      <div
                        className="pc-store-item-header"
                        onClick={() => navigate(`/store/${encodeURIComponent(store.name)}`)}
                      >
                        <img
                          src={store.filterimage || '/img/default.jpg'}
                          alt={store.name}
                          className="store-thumbnail"
                        />
                        <div className="store-info-text">
                          <h3 className="store-name">{store.name}</h3>

                          {/* ⭐ 별점과 리뷰 수 반영 */}
                          <div className="rating-review">
                            <div className="store-stars">
                              {[...Array(5)].map((_, i) => {
                                const value = i + 1
                                let imgSrc = ""

                                if ((rating?.average ?? 0) >= value) {
                                  imgSrc = "/img/icon/단골등록해제.svg" // 가득 찬 별
                                } else if ((rating?.average ?? 0) + 0.25 >= value) {
                                  imgSrc = "/img/icon/반쪽자리별.svg" // 반쪽 별
                                } else {
                                  imgSrc = "/img/icon/단골등록.svg" // 빈 별
                                }

                                return (
                                  <img
                                    key={i}
                                    src={imgSrc}
                                    alt="별"
                                    className="star-icon"
                                  />
                                )
                              })}
                              <span className="review-star-value">
                                {(rating?.average ?? 0).toFixed(1)}점
                              </span>
                            </div>
                            <span className="review-count">
                              ({rating?.count || 0} 리뷰)
                            </span>
                          </div>

                          <p className="store-address"><strong>주소:</strong> {store.address}</p>
                          <p className="store-phone"><strong>T.</strong> {store.phone}</p>
                          {activeFilters.includes('예약가능') && store.options?.includes('예약가능') && (
                            <div
                              className="reservation-tag"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTriggeredFromReservation(true); // 문의 팝업용
                                setSelectedStore(store);
                                setSelectedAction(null);
                              }}
                            >
                              예약문의하기
                            </div>

                          )}
                        </div>
                      </div>

                      {store.options?.length > 0 && (
                        <div className="option-list">
                          {(openOptions[store.name] ? store.options : store.options.slice(0, 5)).map(opt => (
                            <span key={opt} className="option-tag">#{opt}</span>
                          ))}
                          {store.options.length > 5 && (
                            <button
                              className="toggle-options-button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenOptions(prev => ({
                                  ...prev,
                                  [store.name]: !prev[store.name],
                                }))
                              }}
                            >
                              {openOptions[store.name] ? '간략히 ▲' : '더보기 ▼'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ✅ 지도 + 팝업 */}
              <div className="pc-map-wrapper">
                <div id="filterMap" className="pc-map" />
                {selectedStore && !triggeredFromReservation && (
                  <div className="popup-store-card">
                    <div className="card-header">
                      <h3 className="store-name">{selectedStore.name}</h3>
                      <button
                        className="close-button"
                        onClick={() => setSelectedStore(null)}
                      >
                        ✖
                      </button>
                    </div>
                    <p className="store-address">{selectedStore.address}</p>
                    <p className="store-phone">{selectedStore.phone}</p>
                    <a
                      href={`https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="filter-map-link"
                    >
                      길찾기
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}


      {selectedStore && !selectedAction && triggeredFromReservation && (
        <div className="contact-choice-popup" ref={popupRef}>
          <h3>{selectedStore.name} 문의하기</h3>
          <div className="contact-options">
            <div className="option" onClick={() => setSelectedAction("call")}>
              <img src="/img/icon/전화걸기.svg" alt="전화" />
              <span>전화하기</span>
            </div>

            {reservableStores.includes(selectedStore.name) && (
              <div className="option" onClick={() => setSelectedAction("message")}>
                <img src="/img/icon/문자보내기.svg" alt="문자" />
                <span>문자 보내기</span>
              </div>
            )}
          </div>
          <button className="close-btn" onClick={handleClose}>닫기</button>
        </div>
      )}

      {selectedStore && selectedAction === "call" && (
        <div className="call-popup" ref={popupRef}>
          <a
            href={`tel:${selectedStore.phone.replace(/[^0-9]/g, "")}`}
            className="call-button"
          >
            {selectedStore.phone} 로 전화 걸기
          </a>
          <button className="close-btn" onClick={handleClose}>닫기</button>
        </div>
      )}

      {selectedStore && selectedAction === "message" && (
        <div className="message-popup" ref={popupRef}>
          <h3>{selectedStore.name}에 문자 보내기</h3>
          <textarea
            placeholder="문의하실 내용을 입력해주세요."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="message-textarea"
          />
          <div className="popup-buttons">
            <button
              onClick={() => {
                alert(`${selectedStore.name}에 보낸 문자:\n\n${messageText}`);
                handleClose();
              }}
            >
              보내기
            </button>
            <button onClick={handleClose}>취소</button>
          </div>
        </div>
      )}

    </div>
  );
}