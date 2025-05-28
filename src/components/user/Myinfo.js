import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./MyInfo.css";
export default function Myinfo() {
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUser = async () => {
            const user = auth.currentUser;
            if (!user)
                return;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setNickname(data.nickname || "");
                setPhone(data.phone || "");
            }
            setLoading(false);
        };
        fetchUser();
    }, []);
    const handleUpdate = async () => {
        const user = auth.currentUser;
        if (!user)
            return;
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            nickname,
            phone,
        });
        alert("정보가 수정되었습니다!");
    };
    if (loading)
        return _jsx("p", { children: "\uB85C\uB529 \uC911..." });
    return (_jsxs("div", { className: "myinfo-container", children: [_jsx("h2", { children: "\uD83D\uDEE0 \uB0B4 \uC815\uBCF4 \uC218\uC815" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\uC774\uB984" }), _jsx("input", { value: nickname, onChange: (e) => setNickname(e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\uC804\uD654\uBC88\uD638" }), _jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value) })] }), _jsx("button", { onClick: handleUpdate, children: "\uC800\uC7A5" })] }));
}
