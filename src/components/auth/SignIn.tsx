// src/components/auth/Login.tsx
import React, { useState, useEffect } from "react"
import { auth, db } from "../../firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import "./SignIn.css"

declare global {
    interface Window {
        Kakao: any;
    }
}

export default function Signin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate("/") // 로그인 후 메인 페이지로 이동
        } catch (err: any) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.")
        }
    }

    useEffect(() => {
        const user = auth.currentUser
        if (user && !user.emailVerified) {
            alert("이메일 인증을 완료해주세요.")
            navigate("/")
        }

        if (!window.Kakao.isInitialized()) {
            window.Kakao.init("d8e76007c8b0148a086c37901f73bd54"); // ← 실제 키 넣어줘
        }
    }, [])

    const handleKakaoLogin = () => {
        window.Kakao.Auth.login({
            scope: "profile_nickname, account_email",
            success: async (authObj: any) => {
                try {
                    window.Kakao.API.request({
                        url: "/v2/user/me",
                        success: async (res: any) => {
                            const kakaoId = res.id.toString()
                            const userRef = doc(db, "users", kakaoId)
                            const userSnap = await getDoc(userRef)

                            if (userSnap.exists()) {
                                // 로그인 성공 시 원하는 상태 처리 (예: localStorage 저장)
                                alert("카카오 로그인 성공!")
                                navigate("/")
                            } else {
                                alert("회원가입 정보가 없습니다. 먼저 회원가입을 진행해주세요.")
                            }
                        },
                        fail: (err: any) => {
                            console.error("카카오 유저 정보 불러오기 실패", err)
                            setError("카카오 사용자 정보를 불러올 수 없습니다.")
                        }
                    })
                } catch (error) {
                    console.error("카카오 로그인 처리 중 오류", error)
                    setError("카카오 로그인 중 오류가 발생했습니다.")
                }
            },
            fail: (err: any) => {
                console.error("카카오 로그인 실패", err)
                setError("카카오 로그인에 실패했습니다.")
            }
        })
    }

    return (
        <div className="signup-page">
            <div className="signup-wrapper">
                <div className="auth-image" />
                <div className="signup-text">로그인</div>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <br />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <br />
                    <button type="submit" className="Buttons">로그인</button>
                </form>

                <button onClick={handleKakaoLogin} className="kakao">카카오로 로그인</button>

                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    )
}
