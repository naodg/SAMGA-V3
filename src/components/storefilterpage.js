import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// PC 버전은 그대로 유지하고, 모바일에서 가게 리스트 누락 및 지도 렌더링 문제 해결
// 모바일에서 지도 ID 중복 사용으로 생긴 문제 해결, 지도는 따로 렌더링되도록 분리
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeData } from '../data/storeData';
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import './storefilterpage.css';
const filters = [
    { label: '주차장', key: '주차장' },
    { label: '남여 화장실 구분', key: '남여화장실구분' },
    { label: '예약 가능', key: '예약가능' },
    { label: '단체 이용.예약 가능', key: '단체이용예약가능' },
    { label: '무료 WIFI', key: '무료wifi' },
    { label: '유아의자', key: '유아의자' },
    { label: '일반 식사 메뉴', key: '일반식사메뉴' },
    { label: '주문 배송', key: '주문배송' },
    { label: '포장가능', key: '포장가능' },
    { label: '제로페이', key: '제로페이' },
];
export default function StoreFilterPage() {
    const [activeFilters, setActiveFilters] = useState([]);
    const [filteredStores, setFilteredStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const isMobile = window.innerWidth <= 1200;
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const overlaysRef = useRef([]);
    const navigate = useNavigate();
    const mapId = isMobile ? 'mobileMap' : 'filterMap';
    const [paddingSize, setPaddingSize] = useState('120px');
    const [openOptions, setOpenOptions] = useState({});
    // ✅ 먼저 상태 추가
    const [searchQuery, setSearchQuery] = useState('');
    const getStoreRatingData = async (storeId) => {
        const q = query(collection(db, "reviews"), where("storeId", "==", storeId));
        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => doc.data());
        const total = reviews.reduce((acc, r) => acc + (r.star || 0), 0);
        const average = reviews.length ? total / reviews.length : 0;
        return {
            average: Number(average.toFixed(1)),
            count: reviews.length
        };
    };
    useEffect(() => {
        const updatePadding = () => {
            const width = window.innerWidth;
            if (width <= 1600) {
                setPaddingSize('0px'); // 태블릿: 양쪽 40px
            }
            else {
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
            : storeData.filter(store => activeFilters.every(filterKey => store.options?.includes(filterKey)));
        setFilteredStores(stores);
    }, [activeFilters]);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=d65716a4db9e8a93aaff1dfc09ee36b8`;
        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById(mapId);
                if (!container)
                    return;
                const map = new window.kakao.maps.Map(container, {
                    center: new window.kakao.maps.LatLng(35.413, 128.123),
                    level: 4
                });
                mapRef.current = map;
                updateMarkers(activeFilters.length === 0 ? storeData : filteredStores);
                // 지도 초기화 후 강제로 리사이즈
                setTimeout(() => {
                    window.kakao.maps.event.trigger(map, 'resize');
                }, 200); // 지도 생성 후 살짝 delay 줘도 좋아
            });
        };
        document.head.appendChild(script);
    }, [showMap, filteredStores]);
    const updateMarkers = (stores) => {
        const map = mapRef.current;
        if (!map)
            return;
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
                    }
                    else {
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
    const toggleFilter = (key) => {
        setActiveFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
    };
    // 리뷰
    const [storeRatings, setStoreRatings] = useState({});
    useEffect(() => {
        const fetchAllRatings = async () => {
            const result = {};
            for (let i = 0; i < storeData.length; i++) {
                const storeId = `store${i + 1}`; // ✅ 이렇게 파싱!
                const rating = await getStoreRatingData(storeId);
                result[storeId] = rating;
            }
            setStoreRatings(result);
        };
        fetchAllRatings();
    }, []);
    return (_jsx("div", { children: isMobile ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mobile-search-wrapper", children: _jsxs("div", { className: "mobile-search-bar", children: [_jsx("button", { className: "search-icon-button", onClick: () => {
                                    if (searchQuery.trim() === '') {
                                        setFilteredStores(storeData);
                                        setSelectedStore(null);
                                    }
                                    else {
                                        const results = storeData.filter(store => store.name.includes(searchQuery));
                                        setFilteredStores(results);
                                        setSelectedStore(results[0] ?? null);
                                    }
                                }, children: _jsx("img", { src: "/SAMGA-V2/img/logo/search.svg", alt: "\uAC80\uC0C9 \uC544\uC774\uCF58" }) }), _jsx("input", { type: "text", value: searchQuery, className: "search-input", placeholder: "\uB0B4\uAC00 \uCC3E\uB294 \uC2DD\uB2F9\uC744 \uAC80\uC0C9\uD574\uBCF4\uC138\uC694.", onFocus: () => setShowMap(true), onChange: (e) => {
                                    const keyword = e.target.value;
                                    setSearchQuery(keyword);
                                    if (keyword.trim() === '') {
                                        setFilteredStores(storeData);
                                        setSelectedStore(null);
                                    }
                                    else {
                                        const results = storeData.filter(store => store.name.includes(keyword));
                                        setFilteredStores(results);
                                        setSelectedStore(results[0] ?? null);
                                    }
                                }, onKeyDown: (e) => {
                                    if (e.key === 'Enter') {
                                        const results = storeData.filter(store => store.name.includes(searchQuery));
                                        setFilteredStores(results);
                                        setSelectedStore(results[0] ?? null);
                                    }
                                } })] }) }), _jsxs("div", { className: "mobile-filter-bar", children: [_jsx("button", { onClick: () => setShowMap(!showMap), className: "toggle-map-button", children: _jsx("img", { src: '/SAMGA-V2/img/icon/map.svg', width: "15px" }) }), filters.map(({ label, key }) => (_jsxs("button", { onClick: () => toggleFilter(key), className: `filter-button ${activeFilters.includes(key) ? 'active' : ''}`, children: [label, " ", activeFilters.includes(key) && _jsx("span", { className: "remove-x", children: "\u00D7" })] }, key)))] }), showMap && (_jsxs("div", { className: "mobile-map-wrapper", children: [_jsx("div", { id: "mobileMap", className: "mobile-map" }), selectedStore && (_jsxs("div", { className: "mobile-map-store-card", children: [_jsxs("div", { className: "store-card-header", children: [_jsx("h3", { children: selectedStore.name }), _jsx("button", { onClick: () => setShowMap(false), className: "close-button", children: "\u2716" })] }), _jsx("p", { className: "store-address", children: selectedStore.address }), _jsx("p", { className: "store-phone", children: selectedStore.phone }), _jsx("a", { href: `https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}`, target: "_blank", rel: "noopener noreferrer", className: "map-link", children: "\uAE38\uCC3E\uAE30" })] }))] })), _jsxs("div", { className: "mobile-store-list", children: [filteredStores.map((store, index) => {
                            const storeId = `store${index + 1}`;
                            const rating = storeRatings[storeId];
                            return (_jsxs("div", { className: "mobile-store-item", onClick: () => navigate(`/store/${encodeURIComponent(store.name)}`), children: [_jsxs("div", { className: "store-item-header", children: [_jsx("img", { src: store.image || '/SAMGA-V2/img/default.jpg', alt: store.name, className: "store-thumbnail" }), _jsxs("div", { className: "store-info-text", children: [_jsx("h3", { className: "store-name", children: store.name }), _jsxs("div", { className: "store-stars", children: [[...Array(5)].map((_, i) => {
                                                                const value = i + 1;
                                                                let imgSrc = "";
                                                                if ((rating?.average ?? 0) >= value) {
                                                                    imgSrc = "/SAMGA-V2/img/icon/단골등록해제.svg"; // 가득 찬 별
                                                                }
                                                                else if ((rating?.average ?? 0) + 0.25 >= value) {
                                                                    imgSrc = "/SAMGA-V2/img/icon/반쪽자리별.svg"; // 반쪽 별
                                                                }
                                                                else {
                                                                    imgSrc = "/SAMGA-V2/img/icon/단골등록.svg"; // 빈 별
                                                                }
                                                                return (_jsx("img", { src: imgSrc, alt: "\uBCC4", className: "star-icon" }, i));
                                                            }), _jsxs("span", { className: "review-star-value", children: [(rating?.average ?? 0).toFixed(1), "\uC810"] })] }), _jsxs("span", { className: "review-count", children: ["(", rating?.count || 0, " \uB9AC\uBDF0)"] }), _jsx("p", { className: "store-address", children: store.address }), _jsx("p", { className: "store-phone", children: store.phone })] })] }), store.options?.length > 0 && (_jsxs("div", { className: "option-list", children: [(openOptions[store.name] ? store.options : store.options.slice(0, 3)).map(opt => (_jsxs("span", { className: "option-tag", children: ["#", opt] }, opt))), store.options.length > 3 && (_jsx("button", { className: "toggle-options-button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    setOpenOptions(prev => ({
                                                        ...prev,
                                                        [store.name]: !prev[store.name],
                                                    }));
                                                }, children: openOptions[store.name] ? '간략히 ▲' : '더보기 ▼' }))] }))] }, store.name));
                        }), selectedStore && (_jsxs("div", { className: "popup-store-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "store-name", children: selectedStore.name }), _jsx("button", { onClick: () => setSelectedStore(null), className: "close-button", children: "\u2716" })] }), _jsx("p", { className: "store-address", children: selectedStore.address }), _jsx("p", { className: "store-phone", children: selectedStore.phone }), _jsx("a", { href: `https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}`, target: "_blank", rel: "noopener noreferrer", className: "map-link", children: "\uAE38\uCC3E\uAE30" })] }))] })] })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "pc-wrapper", children: [_jsx("div", { className: "pc-search-wrapper", children: _jsxs("div", { className: "pc-search-bar", children: [_jsx("button", { className: "search-icon-button-fillter", onClick: () => {
                                        if (searchQuery.trim() === '') {
                                            setFilteredStores(storeData);
                                            setSelectedStore(null);
                                        }
                                        else {
                                            const results = storeData.filter(store => store.name.includes(searchQuery));
                                            setFilteredStores(results);
                                            setSelectedStore(results[0] ?? null);
                                        }
                                    }, children: _jsx("img", { src: "/SAMGA-V2/img/logo/search.svg", alt: "\uAC80\uC0C9 \uC544\uC774\uCF58" }) }), _jsx("input", { type: "text", value: searchQuery, placeholder: "\uB0B4\uAC00 \uCC3E\uB294 \uC2DD\uB2F9\uC744 \uAC80\uC0C9\uD574\uBCF4\uC138\uC694.", className: "search-input", onFocus: () => setShowMap(true), onChange: (e) => {
                                        const keyword = e.target.value;
                                        setSearchQuery(keyword);
                                        if (keyword.trim() === '') {
                                            setFilteredStores(storeData);
                                            setSelectedStore(null);
                                        }
                                        else {
                                            const results = storeData.filter(store => store.name.includes(keyword));
                                            setFilteredStores(results);
                                            setSelectedStore(results[0] ?? null);
                                        }
                                    }, onKeyDown: (e) => {
                                        if (e.key === 'Enter') {
                                            const results = storeData.filter(store => store.name.includes(searchQuery));
                                            setFilteredStores(results);
                                            setSelectedStore(results[0] ?? null);
                                        }
                                    } })] }) }), _jsx("hr", { className: "search-divider" }), _jsx("div", { className: "pc-filter-bar", children: filters.map(({ label, key }) => (_jsxs("button", { onClick: () => toggleFilter(key), className: `filter-button ${activeFilters.includes(key) ? 'active' : ''}`, children: [label, " ", activeFilters.includes(key) && _jsx("span", { className: "remove-x", children: "\u00D7" })] }, key))) }), _jsxs("div", { className: "pc-main-layout", style: { padding: `0 ${paddingSize}` }, children: [_jsx("div", { className: "pc-store-list", children: filteredStores.map((store, index) => {
                                    const storeId = `store${index + 1}`;
                                    const rating = storeRatings[storeId];
                                    return (_jsxs("div", { className: "pc-store-item", children: [_jsxs("div", { className: "pc-store-item-header", onClick: () => navigate(`/store/${encodeURIComponent(store.name)}`), children: [_jsx("img", { src: store.filterimage || '/SAMGA-V2/img/default.jpg', alt: store.name, className: "store-thumbnail" }), _jsxs("div", { className: "store-info-text", children: [_jsx("h3", { className: "store-name", children: store.name }), _jsxs("div", { className: "rating-review", children: [_jsxs("div", { className: "store-stars", children: [[...Array(5)].map((_, i) => {
                                                                                const value = i + 1;
                                                                                let imgSrc = "";
                                                                                if ((rating?.average ?? 0) >= value) {
                                                                                    imgSrc = "/SAMGA-V2/img/icon/단골등록해제.svg"; // 가득 찬 별
                                                                                }
                                                                                else if ((rating?.average ?? 0) + 0.25 >= value) {
                                                                                    imgSrc = "/SAMGA-V2/img/icon/반쪽자리별.svg"; // 반쪽 별
                                                                                }
                                                                                else {
                                                                                    imgSrc = "/SAMGA-V2/img/icon/단골등록.svg"; // 빈 별
                                                                                }
                                                                                return (_jsx("img", { src: imgSrc, alt: "\uBCC4", className: "star-icon" }, i));
                                                                            }), _jsxs("span", { className: "review-star-value", children: [(rating?.average ?? 0).toFixed(1), "\uC810"] })] }), _jsxs("span", { className: "review-count", children: ["(", rating?.count || 0, " \uB9AC\uBDF0)"] })] }), _jsxs("p", { className: "store-address", children: [_jsx("strong", { children: "\uC8FC\uC18C:" }), " ", store.address] }), _jsxs("p", { className: "store-phone", children: [_jsx("strong", { children: "T." }), " ", store.phone] })] })] }), store.options?.length > 0 && (_jsxs("div", { className: "option-list", children: [(openOptions[store.name] ? store.options : store.options.slice(0, 5)).map(opt => (_jsxs("span", { className: "option-tag", children: ["#", opt] }, opt))), store.options.length > 5 && (_jsx("button", { className: "toggle-options-button", onClick: (e) => {
                                                            e.stopPropagation();
                                                            setOpenOptions(prev => ({
                                                                ...prev,
                                                                [store.name]: !prev[store.name],
                                                            }));
                                                        }, children: openOptions[store.name] ? '간략히 ▲' : '더보기 ▼' }))] }))] }, store.name));
                                }) }), _jsxs("div", { className: "pc-map-wrapper", children: [_jsx("div", { id: "filterMap", className: "pc-map" }), selectedStore && (_jsxs("div", { className: "popup-store-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "store-name", children: selectedStore.name }), _jsx("button", { className: "close-button", onClick: () => setSelectedStore(null), children: "\u2716" })] }), _jsx("p", { className: "store-address", children: selectedStore.address }), _jsx("p", { className: "store-phone", children: selectedStore.phone }), _jsx("a", { href: `https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}`, target: "_blank", rel: "noopener noreferrer", className: "map-link", children: "\uAE38\uCC3E\uAE30" })] }))] })] })] }) })) }));
}
