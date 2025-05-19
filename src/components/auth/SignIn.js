import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/auth/Login.tsx
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/"); // 로그인 후 메인 페이지로 이동
        }
        catch (err) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };
    useEffect(() => {
        const user = auth.currentUser;
        if (user && !user.emailVerified) {
            alert("이메일 인증을 완료해주세요.");
            navigate("/");
        }
        if (!window.Kakao.isInitialized()) {
            window.Kakao.init("d8e76007c8b0148a086c37901f73bd54"); // ← 실제 키 넣어줘
        }
    }, []);
    const handleKakaoLogin = () => {
        window.Kakao.Auth.login({
            scope: "profile_nickname, account_email",
            success: async (authObj) => {
                try {
                    window.Kakao.API.request({
                        url: "/v2/user/me",
                        success: async (res) => {
                            const kakaoId = res.id.toString();
                            const userRef = doc(db, "users", kakaoId);
                            const userSnap = await getDoc(userRef);
                            if (userSnap.exists()) {
                                // 로그인 성공 시 원하는 상태 처리 (예: localStorage 저장)
                                alert("카카오 로그인 성공!");
                                navigate("/");
                            }
                            else {
                                alert("회원가입 정보가 없습니다. 먼저 회원가입을 진행해주세요.");
                            }
                        },
                        fail: (err) => {
                            console.error("카카오 유저 정보 불러오기 실패", err);
                            setError("카카오 사용자 정보를 불러올 수 없습니다.");
                        }
                    });
                }
                catch (error) {
                    console.error("카카오 로그인 처리 중 오류", error);
                    setError("카카오 로그인 중 오류가 발생했습니다.");
                }
            },
            fail: (err) => {
                console.error("카카오 로그인 실패", err);
                setError("카카오 로그인에 실패했습니다.");
            }
        });
    };
    return (_jsx("div", { className: "signup-page", children: _jsxs("div", { className: "signup-wrapper", children: [_jsx("div", { className: "auth-image" }), _jsx("div", { className: "signup-text", children: "\uB85C\uADF8\uC778" }), _jsxs("form", { onSubmit: handleLogin, children: [_jsx("input", { type: "email", placeholder: "\uC774\uBA54\uC77C", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx("br", {}), _jsx("input", { type: "password", placeholder: "\uBE44\uBC00\uBC88\uD638", value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx("br", {}), _jsx("button", { type: "submit", className: "Buttons", children: "\uB85C\uADF8\uC778" })] }), _jsx("button", { onClick: handleKakaoLogin, className: "kakao", children: "\uCE74\uCE74\uC624\uB85C \uB85C\uADF8\uC778" }), error && _jsx("p", { style: { color: "red" }, children: error })] }) }));
}
