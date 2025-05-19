import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { collection, getDocs, query, orderBy, where, limit, startAfter, doc, getDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, } from "firebase/firestore";
import { storeData } from "../../data/storeData";
import { useNavigate } from "react-router-dom";
import './ReviewListPage.css';
const getStoreById = (storeId) => {
    const index = parseInt(storeId.replace("store", ""));
    return storeData[index - 1];
};
export default function ReviewListPage() {
    const [reviews, setReviews] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [selectedStoreId, setSelectedStoreId] = useState("all");
    const [isEnd, setIsEnd] = useState(false);
    const navigate = useNavigate();
    const [currentUserRole, setCurrentUserRole] = useState("");
    const [replyContent, setReplyContent] = useState({});
    const [showReplyForm, setShowReplyForm] = useState({});
    const [userStoreId, setUserStoreId] = useState("");
    const [commentsMap, setCommentsMap] = useState({});
    const uid = auth.currentUser?.uid;
    const [likeMap, setLikeMap] = useState({});
    const [likeCountMap, setLikeCountMap] = useState({});
    const fetchReviews = async (initial = false) => {
        let q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(5));
        let storeId = selectedStoreId;
        if (selectedStoreId !== "all") {
            const matchedIndex = storeData.findIndex(s => s.name === selectedStoreId);
            if (matchedIndex !== -1) {
                storeId = `store${matchedIndex + 1}`;
            }
            else {
                console.error("해당 가게 이름이 storeData에 없습니다.");
                return;
            }
            q = query(collection(db, "reviews"), where("storeId", "==", storeId), orderBy("createdAt", "desc"), limit(5));
        }
        if (!initial && lastDoc) {
            q = query(q, startAfter(lastDoc));
        }
        const snapshot = await getDocs(q);
        const newReviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        if (initial) {
            setReviews(newReviews);
        }
        else {
            setReviews(prev => [...prev, ...newReviews]);
        }
        newReviews.forEach(review => {
            fetchCommentsForReview(review.id);
        });
        if (snapshot.docs.length < 12) {
            setIsEnd(true);
        }
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        setLastDoc(lastVisible);
    };
    useEffect(() => {
        const fetchAll = async () => {
            setReviews([]);
            setLastDoc(null);
            setIsEnd(false);
            await fetchReviews(true);
        };
        fetchAll();
    }, [selectedStoreId]);
    useEffect(() => {
        const fetchUserInfo = async () => {
            const user = auth.currentUser;
            if (!user)
                return;
            const docRef = doc(db, "users", user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setCurrentUserRole(data.role);
                setUserStoreId(data.storeId);
            }
        };
        fetchUserInfo();
    }, []);
    const handleSubmitReply = async (reviewId) => {
        const user = auth.currentUser;
        if (!user)
            return alert("로그인 필요");
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        const nickname = snap.exists() ? snap.data().nickname : "알 수 없음";
        if (!replyContent[reviewId]?.trim()) {
            return alert("내용을 입력해주세요.");
        }
        await addDoc(collection(db, "reviews", reviewId, "comments"), {
            content: replyContent[reviewId],
            createdAt: serverTimestamp(),
            nickname,
            userId: user.uid,
        });
        alert("답글이 등록되었습니다!");
        setReplyContent(prev => ({ ...prev, [reviewId]: "" }));
        setShowReplyForm(prev => ({ ...prev, [reviewId]: false }));
    };
    const fetchCommentsForReview = async (reviewId) => {
        const commentSnapshot = await getDocs(collection(db, "reviews", reviewId, "comments"));
        const comments = commentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setCommentsMap(prev => ({ ...prev, [reviewId]: comments }));
    };
    useEffect(() => {
        if (reviews.length && uid) {
            const newLikeMap = {};
            const newCountMap = {};
            reviews.forEach(r => {
                const likes = r.likes || [];
                newLikeMap[r.id] = likes.includes(uid);
                newCountMap[r.id] = likes.length;
            });
            setLikeMap(newLikeMap);
            setLikeCountMap(newCountMap);
        }
    }, [reviews, uid]);
    const toggleLike = async (reviewId) => {
        const user = auth.currentUser;
        if (!user)
            return alert("로그인 필요!");
        const reviewRef = doc(db, "reviews", reviewId);
        const alreadyLiked = likeMap[reviewId];
        if (alreadyLiked) {
            await updateDoc(reviewRef, {
                likes: arrayRemove(user.uid),
            });
            setLikeMap(prev => ({ ...prev, [reviewId]: false }));
            setLikeCountMap(prev => ({ ...prev, [reviewId]: prev[reviewId] - 1 }));
        }
        else {
            await updateDoc(reviewRef, {
                likes: arrayUnion(user.uid),
            });
            setLikeMap(prev => ({ ...prev, [reviewId]: true }));
            setLikeCountMap(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
        }
    };
    return (_jsxs("div", { className: "review-list-page", children: [_jsxs("div", { className: "review-list-header", children: [_jsx("h2", { className: "review-title", children: "\uB9AC\uBDF0 \uBAA9\uB85D" }), _jsxs("select", { value: selectedStoreId, onChange: (e) => setSelectedStoreId(e.target.value), className: "store-filter-dropdown", children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uBCF4\uAE30" }), storeData.map((store, i) => (_jsx("option", { value: store.name, children: store.name }, i)))] })] }), reviews.length === 0 && _jsx("p", { className: "no-review", children: "\uC791\uC131\uB41C \uB9AC\uBDF0\uAC00 \uC544\uC9C1 \uC5C6\uC5B4\uC694!" }), _jsx("div", { className: "review-list-grid", children: reviews.map((review) => {
                    const store = getStoreById(review.storeId);
                    return (_jsx("div", { className: "review-card", onClick: () => navigate(`/review/${review.id}`), style: { cursor: "pointer", position: "relative" }, children: store && (_jsxs(_Fragment, { children: [_jsx("div", { className: "store-badge", children: _jsx("img", { src: `/SAMGA-V3/img/review_icons/${store.name}.jpg`, className: "store-badge-icon", alt: store.name }) }), _jsxs("div", { className: "review-main", children: [_jsxs("div", { className: "review-header", children: [_jsx("h3", { className: "store-name", children: store.name }), _jsxs("div", { className: "review-stars", children: [[...Array(5)].map((_, i) => {
                                                            const value = i + 1;
                                                            const src = review.star >= value
                                                                ? "/SAMGA-V3/img/icon/단골등록해제.svg"
                                                                : review.star + 0.5 >= value
                                                                    ? "/SAMGA-V3/img/icon/반쪽자리별.svg"
                                                                    : "/SAMGA-V3/img/icon/단골등록.svg";
                                                            return _jsx("img", { src: src, className: "star-icon", alt: "\uBCC4" }, i);
                                                        }), _jsxs("span", { className: "review-star-value", children: [(review.star ?? 0).toFixed(1), "\uC810"] })] })] }), _jsx("div", { className: "review-content", children: _jsx("p", { children: review.content }) }), _jsxs("div", { className: "review-footer", children: [_jsxs("div", { className: "review-icons", children: [_jsx("img", { src: likeMap[review.id]
                                                                ? "/SAMGA-V3/img/icon/좋아용누름.svg"
                                                                : "/SAMGA-V3/img/icon/좋아용.svg", alt: "\uC88B\uC544\uC694", onClick: (e) => {
                                                                e.stopPropagation();
                                                                toggleLike(review.id);
                                                            }, style: { cursor: "pointer" } }), _jsx("span", { children: likeCountMap[review.id] || 0 }), _jsx("img", { src: commentsMap[review.id]?.length
                                                                ? "/SAMGA-V3/img/icon/댓글있음.svg"
                                                                : "/SAMGA-V3/img/icon/댓글.svg", alt: "\uB313\uAE00" }), _jsx("span", { children: commentsMap[review.id]?.length })] }), _jsxs("div", { className: "review-meta", children: [_jsxs("span", { className: "review-nickname", children: ["\uC791\uC131\uC790: ", review.nickname] }), _jsx("br", {}), _jsx("span", { className: "review-date", children: review.createdAt?.toDate().toLocaleString() || "날짜 없음" })] })] })] })] })) }, review.id));
                }) }), !isEnd && (_jsx("button", { className: "load-more-button", onClick: () => fetchReviews(), children: "\uB354\uBCF4\uAE30" })), _jsx("button", { className: "write-review-fixed", onClick: () => navigate("/write"), children: "\uB9AC\uBDF0 \uC4F0\uAE30" })] }));
}
