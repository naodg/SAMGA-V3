import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { storeData } from "../../data/storeData";
import "./MyReview.css";
export default function MyReview() {
    const [myReviews, setMyReviews] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchReviews = async () => {
            const user = auth.currentUser;
            if (!user)
                return;
            const q = query(collection(db, "reviews"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMyReviews(list);
            // console.log(list)
        };
        fetchReviews();
    }, []);
    return (_jsx("div", { className: "myreview-container", children: myReviews.length === 0 ? (_jsx("p", { children: "\uC791\uC131\uD55C \uB9AC\uBDF0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsx("div", { className: "review-list", children: myReviews.map((review) => {
                const storeIndex = parseInt(review.storeId.replace("store", ""));
                const store = storeData[storeIndex - 1];
                return (_jsxs("div", { className: "review-card", onClick: () => navigate(`/review/${review.id}`), children: [_jsx("div", { className: "review-store", children: store?.name || "알 수 없는 가게" }), _jsxs("div", { className: "review-star", children: ["\u2B50 ", review.star] }), _jsx("div", { className: "review-content", children: review.content }), _jsx("div", { className: "review-date", children: review.createdAt?.toDate?.().toLocaleDateString?.() })] }, review.id));
            }) })) }));
}
