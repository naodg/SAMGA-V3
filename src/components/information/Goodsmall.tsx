// src/pages/Goodsmall.tsx
import { useNavigate } from "react-router-dom";
import { goodsList } from "../../data/goodsData";
import "./Goodsmall.css";

export default function Goodsmall() {
  const navigate = useNavigate();

  return (
    <div className="goodsmall-container">
      {goodsList.map((item) => (
        <div key={item.id} className="goods-card" onClick={() => navigate(`/goods/${item.id}`)}>
          <img src={item.thumbnail} alt={item.name} />
          <div className="goods-info">
            <p className="goods-name">{item.name}</p>
            <p className="goods-price">{item.price.toLocaleString()}원</p>
            <p className="goods-soldout">품절</p>
          </div>
        </div>
      ))}
    </div>
  );
}
