import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "./Floating.css";
export default function Floating() {
    const [open, setOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [guestCount, setGuestCount] = useState(1);
    const reservableStores = [
        "대가식육식당",
        "대가한우",
        "대산식육식당",
        "대웅식육식당",
        "태영한우",
    ];
    const times = ["11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00"];
    const handleStoreClick = (store) => {
        setSelectedStore(store);
    };
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };
    const handleReservation = () => {
        if (!selectedDate || !selectedTime || !guestCount) {
            alert("날짜, 시간, 인원수를 모두 선택해주세요!");
            return;
        }
        alert(`${selectedStore} 예약 완료: ${selectedDate} ${selectedTime}, ${guestCount}명`);
        setSelectedStore(null); // 팝업 닫기
    };
    return (_jsxs("div", { className: "floating-wrapper", children: [open && (_jsx("div", { className: "dropdown-menu", children: reservableStores.map((store, i) => (_jsx("div", { className: "dropdown-item", onClick: () => handleStoreClick(store), children: store }, i))) })), _jsxs("div", { className: "floating-mascot", onClick: () => setOpen(!open), children: [_jsx("img", { src: "/SAMGA-V3/img/logo/\uD589\uBCF5\uD55C \uC18C\uD0C8\uC774.svg", className: "happy-sotal" }), "\uC608\uC57D"] }), selectedStore && (_jsxs("div", { className: "reservation-popup", children: [_jsxs("h3", { children: [selectedStore, " \uC608\uC57D\uD558\uAE30"] }), _jsx("label", { children: "\uB0A0\uC9DC \uC120\uD0DD:" }), _jsx("input", { type: "date", value: selectedDate, onChange: handleDateChange }), _jsx("label", { children: "\uC2DC\uAC04 \uC120\uD0DD:" }), _jsx("div", { className: "time-buttons", children: times.map((time, i) => (_jsx("button", { className: selectedTime === time ? "active" : "", onClick: () => setSelectedTime(time), children: time }, i))) }), _jsx("label", { children: "\uC778\uC6D0 \uC218:" }), _jsx("select", { value: guestCount, onChange: (e) => setGuestCount(parseInt(e.target.value)), children: [...Array(10)].map((_, i) => (_jsxs("option", { value: i + 1, children: [i + 1, "\uBA85"] }, i + 1))) }), _jsxs("div", { className: "popup-buttons", children: [_jsx("button", { onClick: handleReservation, children: "\uC608\uC57D\uD558\uAE30" }), _jsx("button", { onClick: () => setSelectedStore(null), children: "\uCDE8\uC18C" })] })] }))] }));
}
