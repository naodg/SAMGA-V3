import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Footer.css';
import { useNavigate } from "react-router-dom";
import { storeData } from "../data/storeData";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import PrivacyPolicyModal from './auth/PrivacyPolicyModal';
import { useRef } from "react";
export default function Footer() {
    const navigate = useNavigate();
    const [userStoreId, setUserStoreId] = useState("");
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [openSections, setOpenSections] = useState({
        store: false,
        tour: false,
        manager: false
    });
    const dropdownRef = useRef(null);
    const storeDropdownRef = useRef(null);
    const tourDropdownRef = useRef(null);
    const managerDropdownRef = useRef(null);
    const storeRef = useRef(null);
    const tourRef = useRef(null);
    const managerRef = useRef(null);
    useEffect(() => {
        const fetchUserStoreId = async () => {
            const user = auth.currentUser;
            if (!user)
                return;
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
                setUserStoreId(snap.data().storeId || "");
            }
        };
        fetchUserStoreId();
    }, []);
    useEffect(() => {
        function handleClickOutside(event) {
            // dropdownRef 내부가 아니면 닫기
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        // 문서 전체 클릭 감지
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleClick = async (storeId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            alert("유저 정보를 찾을 수 없습니다.");
            return;
        }
        const userData = userDoc.data();
        const userStoreId = userData.storeId;
        if (userData.role !== "owner" || userStoreId !== storeId) {
            alert("접근 권한이 없습니다!");
            return;
        }
        navigate(`/admin/${storeId}`);
    };
    const toggleSection = (section) => {
        setOpenSections(prev => {
            const newState = {
                store: false,
                tour: false,
                manager: false,
            };
            return {
                ...newState,
                [section]: !prev[section],
            };
        });
    };
    useEffect(() => {
        const handleClickOutside = (e) => {
            const isInsideDropdown = storeDropdownRef.current?.contains(e.target) ||
                tourDropdownRef.current?.contains(e.target) ||
                managerDropdownRef.current?.contains(e.target);
            if (!isInsideDropdown) {
                setOpenSections({ store: false, tour: false, manager: false });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return (_jsx("footer", { className: "custom-footer", children: _jsxs("div", { className: "footer-inner", children: [_jsxs("div", { className: "footer-column left", children: [_jsx("img", { src: "/img/logo/whitelogo.svg", alt: "\uC6B0\uB9AC\uB9C8\uC744\uC0BC\uAC00 \uB85C\uACE0", className: "footer-logo" }), _jsxs("p", { children: ["\uB300\uD45C : \uD569\uCC9C\uAD70\uCCAD", _jsx("br", {}), "\uC0AC\uC5C5\uC790 \uB4F1\uB85D\uBC88\uD638 : 611-83-01516", _jsx("br", {}), "\uC8FC\uC18C : 50231 \uACBD\uC0C1\uB0A8\uB3C4 \uD569\uCC9C\uAD70 \uD569\uCC9C\uC74D \uB3D9\uC11C\uB85C 119", _jsx("br", {}), "\uB300\uD45C\uC804\uD654\uBC88\uD638 : 055-930-3114", _jsx("br", {})] }), _jsxs("ul", { className: "footer-links", children: [_jsx("li", { children: _jsx("a", { children: "\uC774\uC6A9\uC57D\uAD00" }) }), _jsx("li", { children: _jsx("a", { onClick: () => setShowPrivacy(true), children: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68" }) })] }), _jsx("p", { className: "copyright", children: "Copyright \u00A9 \uC6B0\uB9AC\uB9C8\uC744\uC0BC\uAC00. All rights reserved. \uB514\uC790\uC778 by naon" })] }), showPrivacy && _jsx(PrivacyPolicyModal, { onClose: () => setShowPrivacy(false) }), _jsxs("div", { className: "footer-column store", ref: storeRef, children: [_jsxs("h4", { onClick: () => toggleSection('store'), children: ["\uAC00\uAC8C \uB9AC\uC2A4\uD2B8", _jsx("img", { src: `/img/icon/${openSections.store ? 'up' : 'down'}.svg`, width: "14", alt: "toggle" })] }), openSections.store && (_jsx("ul", { className: `store-list ${openSections.store ? 'open' : ''}`, ref: storeDropdownRef, children: storeData.map((store, i) => (_jsx("li", { onClick: () => { navigate(`/store/${encodeURIComponent(store.name)}`); setDropdownOpen(false); }, children: store.name }, i))) }))] }), _jsxs("div", { className: "footer-column tourism", ref: tourRef, children: [_jsxs("h4", { onClick: () => toggleSection('tour'), children: ["\uC8FC\uBCC0\uAD00\uAD11\uC9C0", _jsx("img", { src: `/img/icon/${openSections.tour ? 'up' : 'down'}.svg`, width: "14", alt: "toggle" })] }), openSections.tour && (_jsxs("ul", { className: `tour-list ${openSections.tour ? 'open' : ''}`, ref: storeDropdownRef, children: [_jsx("li", { children: _jsx("a", { href: "https://blog.naver.com/hc-urc/222571944010", target: "_blank", rel: "noopener noreferrer", children: "\uC0BC\uAC00\uD2B9\uD654\uAC70\uB9AC" }) }), _jsx("li", { children: _jsx("a", { href: "https://www.hc.go.kr/09418/09425/09833.web", target: "_blank", rel: "noopener noreferrer", children: "\uD669\uB9E4\uC0B0" }) }), _jsx("li", { children: _jsx("a", { href: "https://www.youtube.com/watch?v=DjprccTSapc", target: "_blank", rel: "noopener noreferrer", children: "\uC815\uC591\uB2AA" }) }), _jsx("li", { children: _jsx("a", { href: "https://www.youtube.com/watch?v=ZLch32VzUb0", target: "_blank", rel: "noopener noreferrer", children: "\uC0BC\uAC00\uC2DC\uC7A5" }) }), _jsx("li", { children: _jsx("a", { href: "https://hcmoviethemepark.com/", target: "_blank", rel: "noopener noreferrer", children: "\uD569\uCC9C\uC601\uC0C1\uD14C\uB9C8\uD30C\uD06C" }) })] }))] }), _jsxs("div", { className: "footer-column manager", ref: managerRef, children: [_jsxs("h4", { onClick: () => toggleSection('manager'), children: ["\uAC00\uAC8C \uAD00\uB9AC\uC790 \uD398\uC774\uC9C0", _jsx("img", { src: `/img/icon/${openSections.manager ? 'up' : 'down'}.svg`, width: "14", alt: "toggle" })] }), openSections.manager && (_jsx("ul", { className: `manager-list ${openSections.manager ? 'open' : ''}`, ref: storeDropdownRef, children: storeData.map((store, index) => (_jsx("li", { onClick: () => handleClick(`store${index + 1}`), children: store.name }, index))) }))] })] }) }));
}
