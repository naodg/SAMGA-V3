import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/Header.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
export default function Header() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // ✅ 메뉴 열기/닫기 상태 추가
    const location = useLocation();
    const isStoreDetailPage = location.pathname.startsWith('/store/');
    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);
    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };
    return (_jsxs("header", { className: isStoreDetailPage ? 'header white' : 'header', children: [_jsxs("div", { className: "header-inner-pc", children: [_jsx("div", { className: "logo", onClick: () => navigate('/'), children: _jsx("img", { src: isStoreDetailPage ? "/SAMGA-V2/img/logo/whitelogo.svg" : "/SAMGA-V2/img/logo/logo.svg", alt: "\uB85C\uACE0", className: 'logo' }) }), _jsx("nav", { className: "nav", children: _jsxs("ul", { className: "nav-list", children: [_jsx("li", { children: "\u725B\uB9AC\uB9C8\uC744 \uC18C\uAC1C" }), _jsx("li", { onClick: () => navigate('/storefilterpage'), children: "\uC2DD\uC721\uC2DD\uB2F9" }), _jsx("li", { onClick: () => navigate('/review'), children: "\uB9AC\uBDF0" })] }) }), _jsx("div", { className: "user-menu", children: user ? (_jsxs(_Fragment, { children: [_jsx("span", { onClick: () => navigate("/mypage"), className: "clickable", children: "\uB9C8\uC774\uD398\uC774\uC9C0" }), _jsx("span", { onClick: handleLogout, className: "clickable", children: "\uB85C\uADF8\uC544\uC6C3" })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { onClick: () => navigate("/signup"), className: "clickable", children: "\uD68C\uC6D0\uAC00\uC785" }), _jsx("span", { onClick: () => navigate("/login"), className: "clickable", children: "\uB85C\uADF8\uC778" })] })) })] }), _jsxs("div", { className: "header-inner-m", children: [_jsxs("div", { className: "top-row", children: [_jsx("div", { className: "logo", onClick: () => navigate('/'), children: _jsx("img", { src: "/SAMGA-V2/img/logo/logo.svg", alt: "\uB85C\uACE0", className: 'logo' }) }), _jsxs("div", { className: "mobile-menu-icon", onClick: toggleMenu, children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] })] }), _jsx("div", { className: `mobile-user-menu ${menuOpen ? 'open' : ''}`, children: user ? (_jsxs(_Fragment, { children: [_jsx("span", { onClick: () => navigate("/mypage"), children: "\uB9C8\uC774\uD398\uC774\uC9C0" }), _jsx("span", { onClick: handleLogout, children: "\uB85C\uADF8\uC544\uC6C3" })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { onClick: () => navigate("/signup"), children: "\uD68C\uC6D0\uAC00\uC785" }), _jsx("span", { onClick: () => navigate("/login"), children: "\uB85C\uADF8\uC778" })] })) }), _jsx("nav", { className: "nav", children: _jsxs("ul", { className: "nav-list", children: [_jsx("li", { children: "\uC18C\uAC1C" }), _jsx("li", { onClick: () => navigate('/storefilterpage'), children: "\uC2DD\uC721\uC2DD\uB2F9" }), _jsx("li", { onClick: () => navigate('/review'), children: "\uB9AC\uBDF0" })] }) })] })] }));
}
