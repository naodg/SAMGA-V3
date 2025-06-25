import { useEffect, useState } from "react";
import "./Sotal.css";

export default function Sotal() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="vilage-info-page">
      <div className="vilage-images">
        {isMobile ? (
          <img src="/samga/information/소탈이소개m.jpg" alt="소탈이 소개 모바일" />
        ) : (
          <img src="/samga/information/소탈이소개pc.jpg" alt="소탈이 소개 PC" />
        )}
      </div>
      <a
        href="https://www.kogl.or.kr/recommend/recommendDivView.do?recommendIdx=50587&division=img"
        target="_blank"
        rel="noopener noreferrer"
        className="sotal-download-button"
      >
        소탈이 캐릭터 사용하러가기
      </a>
    </div>
  );
}
