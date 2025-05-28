import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, } from "firebase/firestore";
import "./AdminImageUploader.css";
export default function AdminImageUploader() {
    const { storeId } = useParams();
    const [tab, setTab] = useState("menu");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    useEffect(() => {
        const fetchUser = async () => {
            const user = auth.currentUser;
            if (!user) {
                alert("로그인 후 이용해주세요.");
                return;
            }
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                alert("유저 정보가 없습니다.");
                return;
            }
            const data = userDoc.data();
            if (data.role !== "owner") {
                alert("사장님 계정만 업로드할 수 있습니다.");
                return;
            }
            if (!storeId || data.storeId !== storeId) {
                alert("해당 가게에 대한 권한이 없습니다.");
            }
        };
        fetchUser();
    }, [storeId]);
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
            console.log("업로드 대상 경로:", path);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            await addDoc(collection(db, "stores", sanitizedStoreId, tab), {
                url,
                createdAt: serverTimestamp(),
            });
            alert("업로드 완료!");
            setFile(null);
        }
        catch (err) {
            console.error(err);
            alert("업로드 중 오류가 발생했어요.");
        }
        finally {
            setUploading(false);
        }
    };
    if (!storeId)
        return _jsx("div", { children: "\uAC00\uAC8C \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4..." });
    return (_jsxs("div", { className: "admin-uploader-container", children: [_jsxs("div", { children: [_jsx("label", { children: "\uD0ED \uC120\uD0DD: " }), _jsxs("select", { value: tab, onChange: (e) => setTab(e.target.value), children: [_jsx("option", { value: "menu", children: "\uBA54\uB274" }), _jsx("option", { value: "side", children: "\uC0C1\uCC28\uB9BC" }), _jsx("option", { value: "amenities", children: "\uD3B8\uC758\uC2DC\uC124" })] })] }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => setFile(e.target.files?.[0] || null), disabled: uploading }), _jsx("button", { onClick: handleUpload, disabled: uploading || !file, children: uploading ? "업로드 중..." : "업로드" })] }));
}
