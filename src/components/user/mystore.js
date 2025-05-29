import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/mystore.tsx
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { storeData } from "../../data/storeData"; // 로컬에 store 정보 있을 경우
import { useNavigate } from "react-router-dom";
import './myStore.css';
export default function MyStore() {
    const [favoriteStores, setFavoriteStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        if (!storeData.length)
            return; // storeData가 비었으면 잠깐 기다려!
        const fetchFavorites = async () => {
            const user = auth.currentUser;
            if (!user)
                return;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const favorites = userSnap.data().favorites || [];
                const storeDataWithId = storeData.map((store, i) => ({
                    ...store,
                    id: `store${i + 1}`,
                }));
                const filtered = storeDataWithId.filter((store) => favorites.includes(store.id));
                setFavoriteStores(filtered);
            }
            setLoading(false);
        };
        fetchFavorites();
    }, [storeData]); // ✅ storeData 준비될 때까지 기다렸다 실행!
    return (_jsxs("div", { className: "mystore-container", children: [_jsx("h2", { children: "\uB0B4\uAC00 \uB2E8\uACE8 \uB4F1\uB85D\uD55C \uAC00\uAC8C" }), loading ? (_jsx("p", { children: "\uB85C\uB529 \uC911..." })) : favoriteStores.length === 0 ? (_jsx("p", { children: "\uB2E8\uACE8 \uB4F1\uB85D\uD55C \uAC00\uAC8C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsx("div", { className: "mystore-list", children: favoriteStores.map((store, index) => (_jsxs("div", { className: "mystore-card", onClick: () => store.name && navigate(`/store/${encodeURIComponent(store.name)}`), children: [_jsx("img", { src: store.filterimage || "/default.jpg", alt: store.name || "가게 이미지" }), _jsx("div", { className: "mystore-name", children: store.name }), _jsx("div", { className: "mystore-address", children: store.address })] }, store.name || index))) }))] }));
}
