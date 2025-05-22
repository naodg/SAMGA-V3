import './Footer.css';
import { useNavigate } from "react-router-dom"
import { storeData } from "../data/storeData"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase"
import PrivacyPolicyModal from './auth/PrivacyPolicyModal';

export default function Footer() {

  const navigate = useNavigate()

  const [userStoreId, setUserStoreId] = useState("")
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const fetchUserStoreId = async () => {
      const user = auth.currentUser
      if (!user) return

      const snap = await getDoc(doc(db, "users", user.uid))
      if (snap.exists()) {
        setUserStoreId(snap.data().storeId || "")
      }
    }

    fetchUserStoreId()
  }, [])

  const handleClick = async (storeId: string) => {
    const user = auth.currentUser
    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }

    // Firestore에서 유저 정보 불러오기
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (!userDoc.exists()) {
      alert("유저 정보를 찾을 수 없습니다.")
      return
    }

    const userData = userDoc.data()
    const userStoreId = userData.storeId

    if (userData.role !== "owner" || userStoreId !== storeId) {
      alert("접근 권한이 없습니다!")
      console.log(userStoreId, 'dfsdfd', storeId)
      return
    }

    // 권한 확인 후 이동
    navigate(`/admin/${storeId}`)
  }

  return (
    <footer className="custom-footer">
      <div className="footer-inner">

        {/* 1. 로고 + 기본 정보 */}
        <div className="footer-column left">
          <img src="/SAMGA-V3/img/logo/whitelogo.svg" alt="우리마을삼가 로고" className="footer-logo" />
          <p>
            대표 : 합천군청<br />
            사업자 등록번호 : 611-83-01516<br />
            주소 : 50231 경상남도 합천군 합천읍 동서로 119<br />
            {/* 팩스 : 055-930-3111<br /> */}
            대표전화번호 : 055-930-3114<br />
          </p>

          <ul className="footer-links">
            {/* <li><a>회사소개</a></li> */}
            <li><a>이용약관</a></li>
            <li><a onClick={() => setShowPrivacy(true)} style={{ cursor: "pointer" }}>개인정보처리방침</a></li>
            {/* <li><a>이용안내</a></li> */}
          </ul>
          {/* <div className="footer-sns">
            <a>f</a>
            <a>i</a>
            <a>k</a>
          </div> */}

          <p className="copyright">
            Copyright © 우리마을삼가. All rights reserved.<br />
            디자인 by naon
          </p>

        </div>

        {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}



        {/* 2. 가게 리스트 */}
        <div className="footer-column store">
          <h4>가게 리스트</h4>
          <ul className="store-list">
            {storeData.map((store, i) => (
              <li key={i}>
                <div  onClick={() => navigate(`/store/${encodeURIComponent(store.name)}`)}>
                  {store.name}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. 주변 관광지 */}
        <div className="footer-column tourism">
          <h4>주변관광지</h4>
          <ul className="tour-list">
            <li><a href="https://blog.naver.com/hc-urc/222571944010" target="_blank" rel="noopener noreferrer">삼가특화거리</a></li>
            <li><a href="https://www.hc.go.kr/09418/09425/09833.web" target="_blank" rel="noopener noreferrer">황매산</a></li>
            <li><a href="https://www.youtube.com/watch?v=DjprccTSapc" target="_blank" rel="noopener noreferrer">정양늪</a></li>
            <li><a href="https://www.youtube.com/watch?v=ZLch32VzUb0" target="_blank" rel="noopener noreferrer">삼가시장</a></li>
            <li><a href="https://hcmoviethemepark.com/" target="_blank" rel="noopener noreferrer">합천영상테마파크</a></li>
          </ul>
        </div>





        {/* 4. 가게 관리자 페이지 */}
        {/* <div className="footer-column manager">
          <h4>가게 관리자 페이지</h4>
          <ul className="manager-list">
            {storeData.map((store, index) => (
              <li
                key={index}
                onClick={() => handleClick(`store${index + 1}`)}
              >
                {store.name}
              </li>
            ))}

          </ul>
        </div> */}

      </div>



    </footer>
  );
}
