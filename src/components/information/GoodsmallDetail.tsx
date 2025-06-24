// src/pages/GoodsmallDetail.tsx
import { useParams } from "react-router-dom";
import { goodsList } from "../../data/goodsData";
import "./GoodsmallDetail.css";

export default function GoodsmallDetail() {
  const { id } = useParams();
  const product = goodsList.find((item) => item.id === id);

  if (!product) return <div>상품을 찾을 수 없습니다.</div>;

  return (
    <div className="goods-detail-page">
      <div className="goods-image-area">
        <img src={product.images[0]} alt={product.name} />
      </div>

      <div className="goods-info-area">
        <p className="goods-detail-name">{product.name}</p>
        <p className="goods-detail-price">{product.price.toLocaleString()}원</p>
        <p className="goods-detail-delivery">배송방법: 택배 (2,500원)</p>
        <p className="goods-detail-notice">※ 모든 상품은 품절 상태입니다.</p>

        <button className="goods-detail-soldout" disabled>SOLD OUT</button>
      </div>
    </div>
  );
}
