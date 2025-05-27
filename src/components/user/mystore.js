import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/mystore.tsx
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { storeData } from "../../data/storeData"; // 로컬에 store 정보 있을 경우
import { useNavigate } from "react-router-dom";
import './MyStore.css';
export default function MyStore() {
    const [favoriteStores, setFavoriteStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchFavorites = async () => {
            const user = auth.currentUser;
            if (!user)
                return;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            console.log(favoriteStores);
            if (userSnap.exists()) {
                const favorites = userSnap.data().favorites || [];
                const filtered = favorites.map((name) => {
                    const index = storeData.findIndex((store) => store.name === name);
                    if (index === -1)
                        return null;
                    return storeData[index];
                }).filter(Boolean); // null 제거
                setFavoriteStores(filtered);
            }
            setLoading(false);
        };
        fetchFavorites();
    }, []);
    return (_jsxs("div", { className: "mystore-container", children: [_jsx("h2", { children: "\uD83D\uDCCC \uB0B4\uAC00 \uB2E8\uACE8 \uB4F1\uB85D\uD55C \uAC00\uAC8C" }), loading ? (_jsx("p", { children: "\uB85C\uB529 \uC911..." })) : favoriteStores.length === 0 ? (_jsx("p", { children: "\uB2E8\uACE8 \uB4F1\uB85D\uD55C \uAC00\uAC8C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsx("div", { className: "store-list", children: favoriteStores.map((store) => (_jsxs("div", { 
                    // key={store.id}
                    className: "store-card", onClick: () => navigate(`/store/${encodeURIComponent(store.name)}`), children: [_jsx("img", { src: store.filterimage, alt: store.name }), _jsx("div", { className: "store-name", children: store.name }), _jsx("div", { className: "store-address", children: store.address })] }))) }))] }));
}
