// src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header({ isFixed = false }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);


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

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
    console.log('isMobile', isMobile);
  };

  return (
    <header
      className={`header
    ${isStoreDetailPage && !isMobile ? 'white' : ''}
    ${location.pathname === '/storefilterpage' ? 'fixed-header' : ''}
  `}
    >
      {/* PC 헤더 */}
      <div className="header-inner-pc">
        {/* 로고 */}
        <div className="logo" onClick={() => navigate('/')}>
          <img
            src={isStoreDetailPage ? "/img/logo/whitelogo.svg" : "/img/logo/logo.svg"}
            alt="로고"
            className='logo'
          />
        </div>

        {/* 네비게이션 */}
        <nav className="nav">
          <ul className="nav-list">
            <li className='dropdownH' >
              <span className="dropdownH-toggle">牛리마을 소개</span>
              <ul className="dropdownH-menu">
                <li onClick={() => navigate('/vilage')}>우리마을 브랜드 소개</li>
                <li onClick={() => navigate('/mascot')}>소탈이 소개</li>
                <li onClick={() => navigate('/goods')}>굿즈몰</li>
              </ul>
            </li>
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
            {/* <img src={isStoreDetailPage ? "/img/logo/whitelogo.svg" : "/img/logo/logo.svg"} alt="로고" className='logo' /> */}
            <img src={"/img/logo/logo.svg"} alt="로고" className='logo' />
          </div>
          {/* ✅ 이건 항상 보여야 함 */}
          <nav className="nav">
            <ul className="nav-list">

              <li className="dropdownH" ref={dropdownRef}>
                <span className="dropdownM-toggle" onClick={toggleDropdown}>
                  牛리마을{isMobile && <br />}소개
                </span>
                <ul className={`dropdownM-menu ${dropdownOpen ? 'open' : ''}`}>
                  <li onClick={() => { navigate('/vilage'); setDropdownOpen(false); }}>우리마을 브랜드 소개</li>
                  <li onClick={() => { navigate('/mascot'); setDropdownOpen(false); }}>소탈이 소개</li>
                  <li onClick={() => { navigate('/goods'); setDropdownOpen(false); }}>굿즈몰</li>
                </ul>
              </li>

              <li onClick={() => navigate('/storefilterpage')}>식육{isMobile && <br />}식당</li>
              <li onClick={() => navigate('/review')}>리뷰</li>
            </ul>
          </nav>
          <div className={`mobile-menu-icon`} onClick={toggleMenu}>
            {/* <img src={isStoreDetailPage ? "/img/icon/mypagewhite.svg" : "/img/icon/mypageicon.svg"} alt="로고" className='mobile-menu-icon ' /> */}
            <img src={"/img/icon/mypageicon.svg"} alt="로고" className='mobile-menu-icon ' />
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
