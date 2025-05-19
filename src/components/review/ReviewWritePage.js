import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import './ReviewWritePage.css';
import { storeData } from "../../data/storeData";
// 예: store 목록은 이렇게 되어 있다고 가정
export default function ReviewWritePage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedStoreId, setSelectedStoreId] = useState(""); // 기본값 설정
    const navigate = useNavigate();
    const [star, setStar] = useState(0);
    const storeList = storeData.map((store, index) => ({
        name: store.name,
        id: `store${index + 1}`
    }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }
        // 닉네임 불러오기
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const nickname = userDoc.exists() ? userDoc.data().nickname : "알 수 없음";
        try {
            await addDoc(collection(db, "reviews"), {
                title,
                content,
                star,
                userId: user.uid,
                nickname,
                storeId: selectedStoreId,
                createdAt: serverTimestamp()
            });
            alert("리뷰 저장 완료!");
            navigate("/review");
        }
        catch (err) {
            console.error("리뷰 저장 실패:", err);
            alert("저장 중 오류가 발생했습니다.");
        }
    };
    return (_jsxs("div", { className: "review-write-page", children: [_jsx("h2", { children: "\uB9AC\uBDF0 \uC4F0\uAE30" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "store-select-row", children: [_jsx("label", { htmlFor: "store-select", children: "\uAC00\uAC8C \uC120\uD0DD:" }), _jsxs("select", { id: "store-select", value: selectedStoreId, onChange: (e) => setSelectedStoreId(e.target.value), className: "review-input", required: true, children: [_jsx("option", { value: "", disabled: true, children: " - \uAC00\uAC8C\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694 - " }), storeList.map((store) => (_jsx("option", { value: store.id, children: store.name }, store.id)))] })] }), _jsxs("div", { className: "star-rating", children: [[...Array(5)].map((_, i) => {
                                const value = (i + 1) * 1;
                                let imgSrc = "";
                                if (star >= value) {
                                    imgSrc = "/SAMGA-V2/img/icon/단골등록해제.svg"; // ⭐️ 가득 찬 별
                                }
                                else {
                                    imgSrc = "/SAMGA-V2/img/icon/단골등록.svg"; // ⭐️ 빈 별
                                }
                                return (_jsx("img", { src: imgSrc, alt: `${value}점`, className: "star-svg", onClick: () => setStar(value) }, i));
                            }), _jsxs("span", { className: "star-value", children: [star, "\uC810"] })] }), _jsx("textarea", { placeholder: "\uB0B4\uC6A9", value: content, onChange: (e) => setContent(e.target.value), className: "review-textarea", required: true }), _jsx("div", { className: "review-submit-wrapper", children: _jsx("button", { type: "submit", className: "review-submit-button", children: "\uB9AC\uBDF0 \uC800\uC7A5" }) })] })] }));
}
