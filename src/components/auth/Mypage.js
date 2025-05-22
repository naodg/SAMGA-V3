import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
export default function Mypage() {
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUserType = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                setLoading(false);
                return;
            }
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setUserType(data.role === 'owner' ? 'owner' : 'user');
            }
            setLoading(false);
        };
        fetchUserType();
    }, []);
    if (loading)
        return _jsx("div", { children: "\uB85C\uB529 \uC911..." });
    return (_jsxs("div", { className: "mypage-container", children: [_jsx("h2", { children: "\uB9C8\uC774\uD398\uC774\uC9C0" }), userType === 'owner' ? (_jsxs("div", { className: "owner-view", children: [_jsx("h3", { children: "\uD83D\uDC51 \uC0AC\uC7A5\uB2D8 \uC804\uC6A9 \uAE30\uB2A5" }), _jsxs("ul", { children: [_jsx("li", { children: "\uD83D\uDCCC \uB0B4 \uAC00\uAC8C \uC815\uBCF4 \uC218\uC815" }), _jsx("li", { children: "\u2B50 \uB2E8\uACE8 \uACE0\uAC1D \uBAA9\uB85D \uBCF4\uAE30" }), _jsx("li", { children: "\uD83D\uDCDD \uB4F1\uB85D\uB41C \uB9AC\uBDF0 \uD655\uC778" })] })] })) : (_jsxs("div", { className: "user-view", children: [_jsx("h3", { children: "\uD83D\uDE4B\u200D\u2640\uFE0F \uC0AC\uC6A9\uC790 \uB9C8\uC774\uD398\uC774\uC9C0" }), _jsxs("ul", { children: [_jsx("li", { children: "\uD83D\uDCDD \uB0B4\uAC00 \uC4F4 \uB9AC\uBDF0 \uBCF4\uAE30" }), _jsx("li", { children: "\u2764\uFE0F \uCC1C\uD55C \uAC00\uAC8C \uBAA9\uB85D" }), _jsx("li", { children: "\u2699\uFE0F \uB0B4 \uC815\uBCF4 \uC218\uC815" })] })] }))] }));
}
