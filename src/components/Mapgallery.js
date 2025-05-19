import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { storeData } from '../data/storeData';
import './Mapgallery.css';
import { useNavigate } from 'react-router-dom';
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
export default function MapGallery() {
    const [selectedStore, setSelectedStore] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStores, setFilteredStores] = useState(storeData);
    const [showMap, setShowMap] = useState(true);
    const [showStoreInfo, setShowStoreInfo] = useState(false);
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const navigate = useNavigate();
    const handleMarkerClick = (store) => {
        setSelectedStore(store);
        setShowStoreInfo(true);
    };
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
    useEffect(() => {
        if (!showMap || !mapContainerRef.current)
            return;
        const container = mapContainerRef.current;
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
            }
            else {
                window.kakao.maps.load(initializeMap);
            }
        };
        loadKakaoMap();
    }, [showMap, filteredStores]);
    // useEffect(() => {
    //   const handleClickOutside = (e: MouseEvent) => {
    //     const searchBar = document.querySelector('.map-gallery-searchbar');
    //     const mapArea = document.getElementById('map');
    //     const mapContainer = document.querySelector('.map-gallery-map-container'); // ✅ 추가!
    //     const clickedTarget = e.target as Node;
    //     if (
    //       searchBar &&
    //       !searchBar.contains(clickedTarget) &&
    //       mapArea &&
    //       !mapArea.contains(clickedTarget) &&
    //       mapContainer &&
    //       !mapContainer.contains(clickedTarget) // ✅ 여기도 포함시켜!
    //     ) {
    //       setShowMap(false);
    //     }
    //   };
    //   document.addEventListener('mousedown', handleClickOutside);
    //   return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, []);
    return (_jsxs("div", { className: "map-gallery-wrapper", children: [_jsxs("div", { className: "map-gallery-inner", children: [_jsxs("div", { className: "map-gallery-swiper-container", children: [_jsx(Swiper, { className: "map-gallery-swiper", modules: [Navigation, Pagination, Autoplay], navigation: true, pagination: { clickable: true }, autoplay: { delay: 2000, disableOnInteraction: false, }, loop: true, grabCursor: true, simulateTouch: true, touchRatio: 1, allowTouchMove: true, children: ['대가1호점', '대가식육식당', '대가한우', '대산식육식당', '대웅식육식당', '미로식육식당', '불난가한우', '삼가명품한우', '상구한우', '태영한우'].map((name, i) => (_jsx(SwiperSlide, { children: _jsx("img", { src: `/SAMGA-V2/img/landing/${name}_1.jpg`, alt: name, className: "map-gallery-slide-img", draggable: false }) }, i))) }), _jsxs("div", { className: "map-gallery-searchbar", children: [_jsx("button", { className: "search-icon-button", onClick: () => {
                                            if (searchQuery.trim() === '') {
                                                setFilteredStores(storeData);
                                                setSelectedStore(null);
                                            }
                                            else {
                                                const results = storeData.filter(store => store.name.includes(searchQuery));
                                                setFilteredStores(results);
                                                setSelectedStore(results[0] ?? null);
                                            }
                                        }, children: _jsx("img", { src: "/SAMGA-V2/img/logo/search.svg", alt: "\uAC80\uC0C9 \uC544\uC774\uCF58", className: "search-icon-img" }) }), _jsx("input", { type: "text", value: searchQuery, placeholder: "\uB0B4\uAC00 \uCC3E\uB294 \uC2DD\uB2F9\uC744 \uAC80\uC0C9\uD574\uBCF4\uC138\uC694.", onFocus: () => setShowMap(true), onChange: (e) => {
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
                                        } })] })] }), showMap && (_jsxs("div", { className: "map-gallery-map-container", children: [selectedStore && (() => {
                                const storeIndex = storeData.findIndex(s => s.name === selectedStore.name);
                                if (storeIndex === -1)
                                    return null;
                                const storeId = `store${storeIndex + 1}`;
                                const rating = storeRatings[storeId];
                                return (_jsxs("div", { className: "map-gallery-info-card", children: [_jsxs("div", { className: "info-header", children: [_jsxs("h3", { className: "store-name", children: [selectedStore.name, _jsxs("span", { className: "rating", children: [[...Array(5)].map((_, i) => {
                                                                    const value = i + 1;
                                                                    let imgSrc = "";
                                                                    if (rating?.average >= value) {
                                                                        imgSrc = "/SAMGA-V2/img/icon/단골등록해제.svg";
                                                                    }
                                                                    else if (rating?.average + 0.5 >= value) {
                                                                        imgSrc = "/SAMGA-V2/img/icon/반쪽자리별.svg";
                                                                    }
                                                                    else {
                                                                        imgSrc = "/SAMGA-V2/img/icon/단골등록.svg";
                                                                    }
                                                                    return (_jsx("img", { src: imgSrc, alt: "\uBCC4\uC810", className: "star-icon", style: { width: 16, height: 16 } }, i));
                                                                }), _jsxs("span", { className: "review-score", children: [rating?.average?.toFixed(1) || "0.0", "\uC810"] }), _jsxs("span", { className: "review-count", children: ["(", rating?.count || 0, "\uAC1C \uB9AC\uBDF0)"] })] })] }), _jsxs("div", { className: "menu-links", children: [_jsx("span", { className: "link", onClick: () => navigate("/review"), children: "Review" }), _jsx("span", { className: "divider", children: "|" }), _jsx("a", { href: "#", className: "link", children: "\uBA54\uB274\uBCF4\uAE30" })] })] }), _jsxs("p", { className: "store-detail", children: [_jsx("span", { className: "label", children: "\uC8FC\uC18C :" }), " ", selectedStore.address, " T. ", _jsx("b", { children: selectedStore.phone })] }), _jsxs("p", { className: "store-detail", children: [_jsx("span", { className: "label", children: "\uC601\uC5C5\uC2DC\uAC04 :" }), " ", selectedStore.hours.split('/')[0], selectedStore.point && (_jsxs("span", { className: "point", children: [" \u203B ", selectedStore.point] }))] }), _jsxs("p", { className: "store-detail", children: [_jsx("span", { className: "label", children: "\uD734\uBB34 :" }), " ", selectedStore.hours.split('/')[1].replace('휴무', '')] }), _jsxs("div", { className: "map-footer-links", children: [_jsx("a", { href: `https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}`, target: "_blank", rel: "noopener noreferrer", className: "map-link", children: "\uAE38\uCC3E\uAE30" }), _jsx("span", { className: "divider", children: "/" }), _jsx("button", { className: "map-link", onClick: () => navigate(`/store/${encodeURIComponent(selectedStore.name)}`), children: "\uC0C1\uC138\uD398\uC774\uC9C0\uB85C \uAC00\uAE30" })] })] }));
                            })(), _jsx("div", { id: "map", ref: mapContainerRef })] }))] }), _jsx("div", { className: "map-gallery-pattern" }), _jsx("div", { className: "map-gallery-bottom" })] }));
}
