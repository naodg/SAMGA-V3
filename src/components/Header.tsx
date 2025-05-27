// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false)

  const isStoreDetailPage = location.pathname.startsWith('/store/');

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768)
  }

  handleResize() // 초기값 세팅
  window.addEventListener("resize", handleResize)
  return () => window.removeEventListener("resize", handleResize)
}, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header className={isStoreDetailPage ? 'header white' : 'header'}>
      {/* PC 헤더 */}
      <div className="header-inner-pc">
        {/* 로고 */}
        <div className="logo" onClick={() => navigate('/')}>
          <img
            src={isStoreDetailPage ? "/SAMGA-V3/img/logo/whitelogo.svg" : "/SAMGA-V3/img/logo/logo.svg"}
            alt="로고"
            className='logo'
          />
        </div>

        {/* 네비게이션 */}
        <nav className="nav">
          <ul className="nav-list">
            <li>牛리마을 소개</li>
            <li onClick={() => navigate('/storefilterpage')}>식육식당</li>
            <li onClick={() => navigate('/review')}>리뷰</li>
          </ul>
        </nav>

        {/* 유저 메뉴 */}
        <div className="user-menu">
          {user ? (
            <>
              <span onClick={() => navigate("/mypage")} className="clickable">마이페이지</span>
              <span onClick={handleLogout} className="clickable">로그아웃</span>
            </>
          ) : (
            <>
              <span onClick={() => navigate("/signup")} className="clickable">회원가입</span>
              <span onClick={() => navigate("/login")} className="clickable">로그인</span>
            </>
          )}
        </div>
      </div>

      {/* 모바일 헤더 */}
      <div className="header-inner-m">
        <div className="top-row">
          <div className="logo" onClick={() => navigate('/')}>
            <img src={isStoreDetailPage ? "/SAMGA-V3/img/logo/whitelogo.svg" : "/SAMGA-V3/img/logo/logo.svg"} alt="로고" className='logo' />
          </div>
          {/* ✅ 이건 항상 보여야 함 */}
          <nav className="nav">
            <ul className="nav-list">
              <li>牛리마을{isMobile && <br />}소개</li>
              <li onClick={() => navigate('/storefilterpage')}>식육{isMobile && <br />}식당</li>
              <li onClick={() => navigate('/review')}>리뷰</li>
            </ul>
          </nav>
          <div className={`mobile-menu-icon ${isStoreDetailPage ? 'white-logo' : ''
            }`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* ✅ 유저 메뉴만 조건부 렌더링 */}
        {menuOpen && (
          <div className="mobile-user-menu open">
            {user ? (
              <>
                <span onClick={() => navigate("/mypage")}>마이페이지</span>
                <span onClick={handleLogout}>로그아웃</span>
              </>
            ) : (
              <>
                <span onClick={() => navigate("/signup")}>회원가입</span>
                <span onClick={() => navigate("/login")}>로그인</span>
              </>
            )}
          </div>
        )}


      </div>

    </header>
  );
}
