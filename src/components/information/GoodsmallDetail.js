import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/GoodsmallDetail.tsx
import { useParams } from "react-router-dom";
import { goodsList } from "../../data/goodsData";
import "./GoodsmallDetail.css";
export default function GoodsmallDetail() {
    const { id } = useParams();
    const product = goodsList.find((item) => item.id === id);
    if (!product)
        return _jsx("div", { children: "\uC0C1\uD488\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
    return (_jsxs("div", { className: "goods-detail-page", children: [_jsx("div", { className: "goods-image-area", children: _jsx("img", { src: product.images[0], alt: product.name }) }), _jsxs("div", { className: "goods-info-area", children: [_jsx("p", { className: "goods-detail-name", children: product.name }), _jsxs("p", { className: "goods-detail-price", children: [product.price.toLocaleString(), "\uC6D0"] }), _jsx("p", { className: "goods-detail-delivery", children: "\uBC30\uC1A1\uBC29\uBC95: \uD0DD\uBC30 (2,500\uC6D0)" }), _jsx("p", { className: "goods-detail-notice", children: "\u203B \uBAA8\uB4E0 \uC0C1\uD488\uC740 \uD488\uC808 \uC0C1\uD0DC\uC785\uB2C8\uB2E4." }), _jsx("button", { className: "goods-detail-soldout", disabled: true, children: "SOLD OUT" })] })] }));
}
