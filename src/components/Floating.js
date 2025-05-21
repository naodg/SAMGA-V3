import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "./Floating.css";
export default function Floating() {
    const [open, setOpen] = useState(false);
    const reservableStores = [
        "대가식육식당",
        "대가한우",
        "대산식육식당",
        "대웅식육식당",
        "태영한우"
    ];
    return (_jsxs("div", { className: "floating-wrapper", children: [open && (_jsx("div", { className: "dropdown-menu", children: reservableStores.map((store, i) => (_jsx("div", { className: "dropdown-item", children: store }, i))) })), _jsxs("div", { className: "floating-mascot", onClick: () => setOpen(!open), children: [_jsx("img", { src: "/SAMGA-V3/img/logo/\uD589\uBCF5\uD55C \uC18C\uD0C8\uC774.svg", className: "happy-sotal" }), "\uC608\uC57D"] })] }));
}
