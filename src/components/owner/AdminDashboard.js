import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// AdminDashboard.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import './AdminDashboard.css';
import { storeData } from "../../data/storeData";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
export default function AdminDashboard() {
    const { storeId } = useParams(); // store1 등
    const [userStoreId, setUserStoreId] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [authChecked, setAuthChecked] = useState(false);
    const storeIndex = parseInt((storeId || "").replace("store", "")) - 1;
    const storeName = storeData[storeIndex]?.name || storeId;
    useEffect(() => {
        const fetch = async () => {
            const user = auth.currentUser;
            if (!user)
                return;
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (!userSnap.exists())
                return;
            const userData = userSnap.data();
            setUserStoreId(userData.storeId || "");
            if (userData.role === "owner" && userData.storeId === storeId) {
                const favSnap = await getDocs(collection(db, "favorites", storeId, "users"));
                setFavorites(favSnap.docs.map((d) => d.data()));
            }
            setAuthChecked(true);
        };
        console.log(favorites);
        fetch();
    }, [storeId]);
    // 엑셀로 다운로드
    const handleDownload = () => {
        // favorites 배열을 시트로 변환
        const worksheet = XLSX.utils.json_to_sheet(favorites);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Favorites");
        // 파일로 변환
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        // 저장
        saveAs(blob, `${storeName}_단골리스트.xlsx`);
    };
    if (!authChecked)
        return _jsx("p", { children: "\uB85C\uB529 \uC911..." });
    if (userStoreId !== storeId)
        return _jsx("p", { children: "\uD574\uB2F9 \uAC00\uAC8C\uC5D0 \uB300\uD55C \uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." });
    return (_jsxs("div", { className: "admin-wrapper", children: [_jsx("div", { className: "admin-header", children: _jsxs("div", { className: "admin-title", children: [_jsx("img", { src: "/SAMGA-V2//img/icon/\uC218\uD37C\uD788\uC5B4\uB85C\uB79C\uB529.svg", alt: "\uCE90\uB9AD\uD130", className: "admin-icon" }), _jsxs("span", { children: [storeName, " \uB2E8\uACE8 \uB9AC\uC2A4\uD2B8"] })] }) }), _jsxs("table", { className: "admin-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "\uC774\uB984" }), _jsx("th", { children: "\uC804\uD654\uBC88\uD638" }), _jsx("th", { children: "\uC774\uBA54\uC77C" }), _jsx("th", { children: _jsx("img", { src: "/SAMGA-V2//img/icon/\uB2E4\uC6B4\uB85C\uB4DC.svg", alt: "\uB2E4\uC6B4\uB85C\uB4DC", className: "download-icon", onClick: handleDownload }) })] }) }), _jsx("tbody", { children: favorites.map((f, i) => (_jsxs("tr", { children: [_jsx("td", { children: f.nickname }), _jsx("td", { children: f.phone }), _jsx("td", { children: f.email }), _jsx("td", {})] }, i))) })] })] }));
}
