import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import { storage, auth } from "../../firebase";
import "./AdminImageUploader.css";
export default function AdminImageUploader() {
    const { storeId } = useParams();
    const [tab, setTab] = useState("menu");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchImagesFromStorage = async () => {
        if (!storeId)
            return;
        setLoading(true);
        const pathRef = ref(storage, `stores/${storeId}/${tab}`);
        try {
            const res = await listAll(pathRef);
            const urls = await Promise.all(res.items.map((item) => getDownloadURL(item)));
            setImageUrls(urls);
        }
        catch (error) {
            console.error("이미지 불러오기 실패", error);
            setImageUrls([]);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchImagesFromStorage();
    }, [storeId, tab]);
    const handleUpload = async () => {
        if (!file || !storeId) {
            alert("파일 또는 가게 정보가 없습니다.");
            return;
        }
        setUploading(true);
        try {
            const sanitizedFileName = file.name.replaceAll("/", "_").replaceAll(" ", "_");
            const sanitizedStoreId = storeId.replaceAll("/", "_");
            const path = `stores/${sanitizedStoreId}/${tab}/${sanitizedFileName}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            alert("업로드 완료!");
            setFile(null);
            fetchImagesFromStorage();
        }
        catch (err) {
            console.error(err);
            alert("업로드 중 오류가 발생했어요.");
        }
        finally {
            setUploading(false);
        }
    };
    const handleDelete = async (url) => {
        const confirmDelete = window.confirm("정말로 이 이미지를 삭제하시겠습니까?");
        if (!confirmDelete)
            return;
        try {
            console.log("현재 로그인된 유저:", auth.currentUser?.uid);
            const pathStart = `https://firebasestorage.googleapis.com/v0/b/`;
            // const filePath = decodeURIComponent(url.split("?alt=")[0].replace(pathStart, ""))
            const filePath = decodeURIComponent(url.split("/o/")[1].split("?")[0]); // ✅ 'stores/store1/menu/대가1호점_1.jpg'
            console.log("path:", filePath);
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef);
            alert("삭제 완료!");
            fetchImagesFromStorage();
        }
        catch (err) {
            console.error(err);
            alert("삭제 실패");
        }
    };
    if (!storeId)
        return _jsx("div", { children: "\uAC00\uAC8C \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4..." });
    return (_jsxs("div", { className: "admin-uploader-container", children: [_jsx("h2", { children: "\uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC \uBC0F \uAD00\uB9AC" }), _jsxs("div", { className: "tab-select", children: [_jsx("label", { children: "\uD0ED \uC120\uD0DD: " }), _jsxs("select", { value: tab, onChange: (e) => setTab(e.target.value), children: [_jsx("option", { value: "menu", children: "\uBA54\uB274" }), _jsx("option", { value: "side", children: "\uC0C1\uCC28\uB9BC" }), _jsx("option", { value: "amenities", children: "\uD3B8\uC758\uC2DC\uC124" })] })] }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => setFile(e.target.files?.[0] || null), disabled: uploading }), _jsx("button", { onClick: handleUpload, disabled: uploading || !file, children: uploading ? "업로드 중..." : "업로드" }), _jsx("hr", {}), _jsx("div", { className: "uploaded-image-list", children: loading ? (_jsx("p", { children: "\uC774\uBBF8\uC9C0 \uBD88\uB7EC\uC624\uB294 \uC911..." })) : imageUrls.length === 0 ? (_jsx("p", { children: "\uC774\uBBF8\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (imageUrls.map((url, idx) => (_jsxs("div", { className: "uploaded-image-item", children: [_jsx("img", { className: "preview-image", src: url, alt: "\uC5C5\uB85C\uB4DC \uC774\uBBF8\uC9C0" }), _jsx("button", { onClick: () => handleDelete(url), children: "\uC0AD\uC81C" })] }, idx)))) })] }));
}
