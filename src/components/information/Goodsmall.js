import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Goodsmall.tsx
import { useNavigate } from "react-router-dom";
import { goodsList } from "../../data/goodsData";
import "./Goodsmall.css";
export default function Goodsmall() {
    const navigate = useNavigate();
    return (_jsx("div", { className: "goodsmall-container", children: goodsList.map((item) => (_jsxs("div", { className: "goods-card", onClick: () => navigate(`/goods/${item.id}`), children: [_jsx("img", { src: item.thumbnail, alt: item.name }), _jsxs("div", { className: "goods-info", children: [_jsx("p", { className: "goods-name", children: item.name }), _jsxs("p", { className: "goods-price", children: [item.price.toLocaleString(), "\uC6D0"] }), _jsx("p", { className: "goods-soldout", children: "\uD488\uC808" })] })] }, item.id))) }));
}
