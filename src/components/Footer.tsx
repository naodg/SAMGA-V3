import './Footer.css';
import { useNavigate } from "react-router-dom"
import { storeData } from "../data/storeData"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase"
import PrivacyPolicyModal from './auth/PrivacyPolicyModal';
import { useRef } from "react"

export default function Footer() {
  const navigate = useNavigate()
  const [userStoreId, setUserStoreId] = useState("")
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    store: false,
    tour: false,
    manager: false
  });
  const dropdownRef = useRef(null);
  const storeDropdownRef = useRef<HTMLUListElement>(null);
    const tourDropdownRef = useRef<HTMLUListElement>(null);
    const managerDropdownRef = useRef<HTMLUListElement>(null);
  const storeRef = useRef<HTMLDivElement>(null)
  const tourRef = useRef<HTMLDivElement>(null)
  const managerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleClickOutside(event) {
      // dropdownRef 내부가 아니면 닫기
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    // 문서 전체 클릭 감지
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = async (storeId: string) => {
    const user = auth.currentUser
    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }

    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (!userDoc.exists()) {
      alert("유저 정보를 찾을 수 없습니다.")
      return
    }

    const userData = userDoc.data()
    const userStoreId = userData.storeId

    if (userData.role !== "owner" || userStoreId !== storeId) {
      alert("접근 권한이 없습니다!")
      return
    }

    navigate(`/admin/${storeId}`)
  }

const toggleSection = (section: string) => {
  setOpenSections(prev => {
    const newState = {
      store: false,
      tour: false,
      manager: false,
    };
    return {
      ...newState,
      [section]: !prev[section],
    };
  });
};


useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const isInsideDropdown =
      storeDropdownRef.current?.contains(e.target as Node) ||
      tourDropdownRef.current?.contains(e.target as Node) ||
      managerDropdownRef.current?.contains(e.target as Node);

    if (!isInsideDropdown) {
      setOpenSections({ store: false, tour: false, manager: false });
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  return (
    <footer className="custom-footer">
      <div className="footer-inner">

        {/* 1. 로고 + 기본 정보 */}
        <div className="footer-column left">
          <img src="/img/logo/whitelogo.svg" alt="우리마을삼가 로고" className="footer-logo" />
          <p>
            대표 : 합천군청<br />
            사업자 등록번호 : 611-83-01516<br />
            주소 : 50231 경상남도 합천군 합천읍 동서로 119<br />
            대표전화번호 : 055-930-3114<br />
          </p>

          <ul className="footer-links">
            <li><a>이용약관</a></li>
            <li><a onClick={() => setShowPrivacy(true)} >개인정보처리방침</a></li>
          </ul>

          <p className="copyright">
            Copyright © 우리마을삼가. All rights reserved.
            디자인 by naon
          </p>
        </div>

        {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}

        {/* 2. 가게 리스트 */}
        <div className="footer-column store" ref={storeRef}>
          <h4 onClick={() => toggleSection('store')}>
            가게 리스트
            <img src={`/img/icon/${openSections.store ? 'up' : 'down'}.svg`} width="14" alt="toggle" />
          </h4>
          {openSections.store && (
            <ul
                className={`store-list ${openSections.store ? 'open' : ''}`}
                ref={storeDropdownRef}
              >
              {storeData.map((store, i) => (
                <li key={i} onClick={() => {navigate(`/store/${encodeURIComponent(store.name)}`); setDropdownOpen(false);}}>
                  {store.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. 주변 관광지 */}
        <div className="footer-column tourism" ref={tourRef}>
          <h4 onClick={() => toggleSection('tour')}>
            주변관광지
            <img src={`/img/icon/${openSections.tour ? 'up' : 'down'}.svg`} width="14" alt="toggle" />
          </h4>
          {openSections.tour && (
            <ul
                className={`tour-list ${openSections.tour ? 'open' : ''}`}
                ref={storeDropdownRef}
              >
              <li><a href="https://blog.naver.com/hc-urc/222571944010" target="_blank" rel="noopener noreferrer">삼가특화거리</a></li>
              <li><a href="https://www.hc.go.kr/09418/09425/09833.web" target="_blank" rel="noopener noreferrer">황매산</a></li>
              <li><a href="https://www.youtube.com/watch?v=DjprccTSapc" target="_blank" rel="noopener noreferrer">정양늪</a></li>
              <li><a href="https://www.youtube.com/watch?v=ZLch32VzUb0" target="_blank" rel="noopener noreferrer">삼가시장</a></li>
              <li><a href="https://hcmoviethemepark.com/" target="_blank" rel="noopener noreferrer">합천영상테마파크</a></li>
            </ul>
          )}
        </div>

        {/* 4. 가게 관리자 페이지 */}
        <div className="footer-column manager" ref={managerRef}>
          <h4 onClick={() => toggleSection('manager')}>
            가게 관리자 페이지
            <img src={`/img/icon/${openSections.manager ? 'up' : 'down'}.svg`} width="14" alt="toggle" />
          </h4>
          {openSections.manager && (
            <ul
                className={`manager-list ${openSections.manager ? 'open' : ''}`}
                ref={storeDropdownRef}
              >
              {storeData.map((store, index) => (
                <li key={index} onClick={() => handleClick(`store${index + 1}`)}>
                  {store.name}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </footer>
  );
}
