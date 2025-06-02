import { useEffect } from "react"
import { auth } from "../../firebase"
import { signOut } from "firebase/auth"

export default function AutoLogoutTimer() {
  useEffect(() => {
    const timer = setTimeout(() => {
      signOut(auth)
      alert("세션이 만료되어 자동 로그아웃되었습니다.")
      window.location.href = "/login" // or navigate("/login")
    },  43200000) // 1시간 (60 * 60 * 1000)

    return () => clearTimeout(timer)
  }, [])

  return null
}
