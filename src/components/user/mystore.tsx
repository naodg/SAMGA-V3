// src/components/mystore.tsx

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { storeData } from "../../data/storeData"; // 로컬에 store 정보 있을 경우
import { useNavigate } from "react-router-dom";
import './MyStore.css';

export default function MyStore() {
    const [favoriteStores, setFavoriteStores] = useState<typeof storeData>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            console.log(favoriteStores)

            if (userSnap.exists()) {
                const favorites: string[] = userSnap.data().favorites || [];

                const filtered = favorites.map((name) => {
                    const index = storeData.findIndex((store) => store.name === name);
                    if (index === -1) return null;
                    return storeData[index];
                }).filter(Boolean); // null 제거


                setFavoriteStores(filtered);
            }
            setLoading(false);
        };

        fetchFavorites();
    }, []);

    return (
        <div className="mystore-container">
            <h2>📌 내가 단골 등록한 가게</h2>
            {loading ? (
                <p>로딩 중...</p>
            ) : favoriteStores.length === 0 ? (
                <p>단골 등록한 가게가 없습니다.</p>
            ) : (
                <div className="store-list">
                    {favoriteStores.map((store) => (
                        <div
                            // key={store.id}
                            className="store-card"
                            onClick={() =>  navigate(`/store/${encodeURIComponent(store.name)}`)}
                        >
                            <img src={store.filterimage} alt={store.name} />
                            <div className="store-name">{store.name}</div>
                            <div className="store-address">{store.address}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
