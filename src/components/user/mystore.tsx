// src/components/mystore.tsx

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { storeData } from "../../data/storeData"; // 로컬에 store 정보 있을 경우
import { useNavigate } from "react-router-dom";
import './myStore.css';

export default function MyStore() {
    const [favoriteStores, setFavoriteStores] = useState<typeof storeData>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

useEffect(() => {
  if (!storeData.length) return; // storeData가 비었으면 잠깐 기다려!

  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const favorites: string[] = userSnap.data().favorites || [];

      const storeDataWithId = storeData.map((store, i) => ({
        ...store,
        id: `store${i + 1}`,
      }));

      const filtered = storeDataWithId.filter((store) =>
        favorites.includes(store.id)
      );

      setFavoriteStores(filtered);
    }

    setLoading(false);
  };

  fetchFavorites();
}, [storeData]); // ✅ storeData 준비될 때까지 기다렸다 실행!





    return (
        <div className="mystore-container">
            <h2>내가 단골 등록한 가게</h2>
            {loading ? (
                <p>로딩 중...</p>
            ) : favoriteStores.length === 0 ? (
                <p>단골 등록한 가게가 없습니다.</p>
            ) : (
                <div className="mystore-list">
                    {favoriteStores.map((store, index) => (
                        <div
                            key={store.name || index}
                            className="mystore-card"
                            onClick={() =>
                                store.name && navigate(`/store/${encodeURIComponent(store.name)}`)
                            }
                        >
                            <img
                                src={store.filterimage || "/default.jpg"}
                                alt={store.name || "가게 이미지"}
                            />
                            <div className="mystore-name">{store.name}</div>
                            <div className="mystore-address">{store.address}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
