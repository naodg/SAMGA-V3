// src/components/SignUp.tsx
import React, { useState } from "react"
import { auth, db } from "../../firebase"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import "./SignUp.css"
import { useEffect } from "react"
import { getAuth, signInWithCustomToken } from "firebase/auth"


declare global {
    interface Window {
        Kakao: any;
    }
}


export default function SignUp() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nickname, setNickname] = useState("")
    const [phone, setPhone] = useState("")
    const [phoneError, setPhoneError] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const validatePhone = (value: string) => {
        const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;

        if (!phoneRegex.test(value)) {
            setPhoneError("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
        } else {
            setPhoneError("");
        }
    };


    useEffect(() => {
        if (!window.Kakao.isInitialized()) {
            window.Kakao.init("d8e76007c8b0148a086c37901f73bd54"); // ← 실제 키 넣어줘
        }
    }, []);



    const handleSignUp = async (e: React.FormEvent) => {

        e.preventDefault()
        setError("")
        setSuccess("")

        // if (phoneError) {
        //     setError("전화번호 형식을 확인해주세요.")
        //     return
        // }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            await setDoc(doc(db, "users", user.uid), {
                email,
                nickname,
                phone,
                role: "user",
                createdAt: new Date()
            })

            await sendEmailVerification(user)
            setSuccess("회원가입이 완료되었습니다! 이메일을 확인해주세요.")

            setEmail("")
            setPassword("")
            setNickname("")
            setPhone("")
        } catch (err: any) {
            if (err.code === "auth/email-already-in-use") {
                setError("이미 가입된 이메일입니다.")
            } else if (err.code === "auth/invalid-email") {
                setError("이메일 형식이 올바르지 않습니다.")
            } else if (err.code === "auth/weak-password") {
                setError("비밀번호는 6자리 이상이어야 합니다.")
            } else {
                setError("회원가입 중 오류가 발생했습니다.")
            }
        }
    }

    const formatPhoneNumber = (value: string) => {
        const numbersOnly = value.replace(/\D/g, "") // 숫자만 남김

        if (numbersOnly.length < 4) return numbersOnly
        if (numbersOnly.length < 7) {
            return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`
        }
        if (numbersOnly.length <= 11) {
            return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7)}`
        }
        return numbersOnly // 11자리 넘으면 하이픈 없이 그대로
    }



    const handleKakaoLogin = () => {
        window.Kakao.Auth.login({
            scope: "profile_nickname, account_email, ",
            success: async (authObj: any) => {
                try {
                    window.Kakao.API.request({
                        url: "/v2/user/me",
                        success: async (res: any) => {
                            const kakao_account = res.kakao_account
                            const uid = res.id.toString()
                            const email = kakao_account.email || ""
                            const nickname = kakao_account.profile.nickname || ""
                            const phone = ""

                            await setDoc(doc(db, "users", uid), {
                                email,
                                nickname,
                                phone,
                                role: "user",
                                createdAt: new Date(),
                                kakao: true
                            })

                            alert("카카오 회원가입 완료! (Firestore에 저장됨)")
                        },
                        fail: (err: any) => {
                            console.error("카카오 유저 정보 불러오기 실패", err)
                        }
                    })
                } catch (error) {
                    console.error("카카오 회원가입 실패", error)
                }
            },
            fail: (err: any) => {
                console.error("카카오 로그인 실패", err)
            }
        })
    }



    return (
        <div className="signup-page">
            <div className="signup-wrapper">
                <div className="auth-image" />
                <div className="signup-text">회원가입</div>
                <form onSubmit={handleSignUp}>
                    <input
                        type="text"
                        placeholder="본인 이름"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                    />
                    <br />
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
                    <input
                        type="text"
                        placeholder="전화번호 - 제외후 입력해주세요"
                        value={phone}
                        onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value)
                            setPhone(formatted)
                            validatePhone(formatted)
                        }}
                        required
                    />
                    <br />
                    {phoneError && <p style={{ color: "red" }}>{phoneError}</p>}

                    <button type="submit" className="Buttons">회원가입</button>

                    <button type="button" onClick={handleKakaoLogin} className="kakao">
                        카카오로 회원가입
                    </button>

                </form>




                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
            </div>
        </div>
    )
}
