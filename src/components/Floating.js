import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { storeData } from "../data/storeData";
import "./Floating.css";
export default function Floating() {
    const [open, setOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    const [messageText, setMessageText] = useState("");
    const location = useLocation();
    const pathname = location.pathname;
    const popupRef = useRef(null);
    const reservableStores = [
        "대가식육식당",
        "대가한우",
        "대산식육식당",
        "대웅식육식당",
        "태영한우",
    ];
    // 상세페이지인지 확인
    const isDetailPage = pathname.startsWith("/store/");
    const currentStoreName = decodeURIComponent(pathname.replace("/store/", ""));
    const currentStore = storeData.find((store) => store.name === currentStoreName);
    // 팝업 바깥 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current &&
                !popupRef.current.contains(e.target)) {
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
    const handleStoreClick = (storeName) => {
        const found = storeData.find((store) => store.name === storeName);
        if (found) {
            setSelectedStore(found);
            setSelectedAction(null);
        }
    };
    const handleFloatingClick = () => {
        if (isDetailPage && currentStore) {
            // 상세페이지에서는 바로 해당 가게 선택
            setSelectedStore(currentStore);
            setSelectedAction(null);
        }
        else {
            // 일반 페이지는 드롭다운 열기
            setOpen(!open);
        }
    };
    const handleClose = () => {
        setSelectedStore(null);
        setSelectedAction(null);
        setMessageText("");
    };
    return (_jsxs("div", { className: "floating-wrapper", children: [open && !isDetailPage && (_jsx("div", { className: "dropdown-menu", children: storeData.map((store, i) => (_jsx("div", { className: "dropdown-item", onClick: () => handleStoreClick(store.name), children: store.name }, i))) })), _jsx("div", { className: "floating-mascot", onClick: handleFloatingClick, children: _jsx("img", { src: "/SAMGA-V3/img/icon/\uBB38\uC790\uBCF4\uB0B4\uAE30.svg", className: "happy-sotal" }) }), selectedStore && !selectedAction && (_jsxs("div", { className: "contact-choice-popup", ref: popupRef, children: [_jsxs("h3", { children: [selectedStore.name, " \uBB38\uC758\uD558\uAE30"] }), _jsxs("div", { className: "contact-options", children: [_jsxs("div", { className: "option", onClick: () => setSelectedAction("call"), children: [_jsx("img", { src: "/SAMGA-V3/img/icon/\uC804\uD654\uAC78\uAE30.svg", alt: "\uC804\uD654" }), _jsx("span", { children: "\uC804\uD654\uD558\uAE30" })] }), reservableStores.includes(selectedStore.name) && (_jsxs("div", { className: "option", onClick: () => setSelectedAction("message"), children: [_jsx("img", { src: "/SAMGA-V3/img/icon/\uBB38\uC790\uBCF4\uB0B4\uAE30.svg", alt: "\uBB38\uC790" }), _jsx("span", { children: "\uBB38\uC790 \uBCF4\uB0B4\uAE30" })] }))] }), _jsx("button", { className: "close-btn", onClick: handleClose, children: "\uB2EB\uAE30" })] })), selectedStore && selectedAction === "call" && (_jsxs("div", { className: "call-popup", ref: popupRef, children: [_jsxs("a", { href: `tel:${selectedStore.phone.replace(/[^0-9]/g, "")}`, className: "call-button", children: [selectedStore.phone, " \uB85C \uC804\uD654 \uAC78\uAE30"] }), _jsx("button", { className: "close-btn", onClick: handleClose, children: "\uB2EB\uAE30" })] })), selectedStore && selectedAction === "message" && (_jsxs("div", { className: "message-popup", ref: popupRef, children: [_jsxs("h3", { children: [selectedStore.name, "\uC5D0 \uBB38\uC790 \uBCF4\uB0B4\uAE30"] }), _jsx("textarea", { placeholder: "\uBB38\uC758\uD558\uC2E4 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", value: messageText, onChange: (e) => setMessageText(e.target.value), className: "message-textarea" }), _jsxs("div", { className: "popup-buttons", children: [_jsx("button", { onClick: () => {
                                    alert(`${selectedStore.name}에 보낸 문자:\n\n${messageText}`);
                                    handleClose();
                                }, children: "\uBCF4\uB0B4\uAE30" }), _jsx("button", { onClick: handleClose, children: "\uCDE8\uC18C" })] })] }))] }));
}
