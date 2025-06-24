// src/components/goods/GoodsmallDetail.tsx
import { useParams } from "react-router-dom";
import { useState } from "react";
import { goodsList } from "../../data/goodsData";
import "./GoodsmallDetail.css";

export default function GoodsmallDetail() {
  const { id } = useParams();
  const product = goodsList.find((item) => item.id === id);

  // 선택된 이미지 상태
  const [mainImage, setMainImage] = useState(product?.images[0] ?? "");

  if (!product) return <div>상품을 찾을 수 없습니다.</div>;

  return (
    <div className="goods-detail-page">
      <div className="goods-top-area">
        <div>
          {/* 메인 이미지 */}
          <img src={mainImage} alt={product.name} className="main-product-image" />

          {/* 썸네일 리스트 */}
          <div className="thumbnail-list">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} 썸네일 ${idx + 1}`}
                className={`thumbnail-image ${mainImage === img ? "active" : ""}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="goods-info-area">
          <h2 className="goods-detail-name">{product.name}</h2>

          <div className="goods-info-table">
            <div className="goods-info-row">
              <div className="goods-info-label">판매가</div>
              <div className="goods-info-value">{product.price.toLocaleString()}원</div>
            </div>
            <div className="goods-info-row">
              <div className="goods-info-label">배송방법</div>
              <div className="goods-info-value">택배</div>
            </div>
            <div className="goods-info-row">
              <div className="goods-info-label">배송비</div>
              <div className="goods-info-value">3,000원</div>
            </div>
            <div className="goods-info-row">
              <div className="goods-info-label">옵션</div>
              <div className="goods-info-value">
                <select className="goods-option-select" defaultValue="">
                  <option value="" disabled>
                    - [필수] 옵션을 선택해 주세요 -
                  </option>
                  <option value="opt1" disabled>
                    상품명1 (품절)
                  </option>
                  <option value="opt2" disabled>
                    상품명2 (품절)
                  </option>
                  <option value="opt3" disabled>
                    상품명3 (품절)
                  </option>
                </select>
              </div>
            </div>
          </div>

          <p className="goods-detail-notice">※ 모든 상품은 품절 상태입니다.</p>

          <div className="goods-total-section">
            <div className="goods-total-label">총 금액</div>
            <div className="goods-total-price">0원</div>
          </div>

          <button className="goods-detail-soldout" disabled>
            SOLD OUT
          </button>
        </div>

      </div>

      <div className="goods-extra-section">
        <img src={product.detailimage} alt={`${product.name} 상세`} />
      </div>
    </div>
  );
}
