import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { storeData } from "../../data/storeData";
import "./MyReview.css";

interface Review {
  id: string;
  content: string;
  createdAt: any;
  star: number;
  storeId: string;
}

export default function MyReview() {
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setMyReviews(list);
    };

    fetchReviews();
  }, []);

  return (
    <div className="myreview-container">
      <h2>📝 내가 작성한 리뷰</h2>
      {myReviews.length === 0 ? (
        <p>작성한 리뷰가 없습니다.</p>
      ) : (
        <div className="review-list">
          {myReviews.map((review) => {
            const storeIndex = parseInt(review.storeId.replace("store", ""));
            const store = storeData[storeIndex - 1]; // store9 → storeData[8]
            return (
              <div
                className="review-card"
                key={review.id}
                onClick={() => navigate(`/store/${store?.name}`)}
              >
                <div className="review-store">🏪 {store?.name || "알 수 없는 가게"}</div>
                <div className="review-star">⭐ {review.star}</div>
                <div className="review-content">{review.content}</div>
                <div className="review-date">
                  {review.createdAt?.toDate?.().toLocaleDateString?.()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
