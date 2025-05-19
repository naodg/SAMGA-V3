import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "./Floating.css";
export default function Floating() {
    const [open, setOpen] = useState(false);
    const reservableStores = [
        "대가1호점",
        "대가한우",
        "대산식육식당",
        "상구한우",
        "삼가명품한우"
    ];
    return (_jsxs("div", { className: "floating-wrapper", children: [open && (_jsx("div", { className: "dropdown-menu", children: reservableStores.map((store, i) => (_jsx("div", { className: "dropdown-item", children: store }, i))) })), _jsx("div", { className: "floating-mascot", onClick: () => setOpen(!open), children: "\uC608\uC57D" })] }));
}
