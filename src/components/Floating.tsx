import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { storeData } from "../data/storeData";
import "./Floating.css";

export default function Floating() {
  const [open, setOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<typeof storeData[0] | null>(null);
  const [selectedAction, setSelectedAction] = useState<"call" | "message" | null>(null);
  const [messageText, setMessageText] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const pathname = location.pathname;
  const popupRef = useRef<HTMLDivElement>(null);

  const reservableStores = [
    "대가식육식당",
    "대가한우",
    "대산식육식당",
    "대웅식육식당",
    "태영한우",
  ];

  // 상세페이지인지 확인
  const isDetailPage = pathname.startsWith("/store/");
  const currentStoreName = decodeURIComponent(pathname.replace("/store/", ""));
  const currentStore = storeData.find((store) => store.name === currentStoreName);

  // 팝업 바깥 클릭 시 닫기
  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    const isInsidePopup = popupRef.current?.contains(target);
    const isInsideDropdown = dropdownRef.current?.contains(target);

    // 1. popup이 열려 있고, 바깥을 클릭했다면 popup만 닫기
    if (selectedStore && !isInsidePopup) {
      setSelectedStore(null);
      setSelectedAction(null);
      setMessageText("");
      return; // 👉 드롭다운은 그대로 둠
    }

    // 2. 드롭다운만 열려 있고, 바깥을 클릭했다면 드롭다운 닫기
    if (open && !isInsideDropdown) {
      setOpen(false);
    }
  };

  if (selectedStore || open) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [selectedStore, open]);




  const handleStoreClick = (storeName: string) => {
    const found = storeData.find((store) => store.name === storeName);
    if (found) {
      setSelectedStore(found);
      setSelectedAction(null);
      if (!isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ PC에서 상단 이동
      }
    }
  };

  const handleFloatingClick = () => {
    if (isDetailPage && currentStore) {
      // 상세페이지에서는 바로 해당 가게 선택
      setSelectedStore(currentStore);
      setSelectedAction(null);
    } else {
      // 일반 페이지는 드롭다운 열기
      setOpen(!open);
    }
  };

  const handleClose = () => {
    setSelectedStore(null);
    setSelectedAction(null);
    setMessageText("");
  };


  const [isMobile, setIsMobile] = useState(true);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);



  return (
    <div className="floating-wrapper">
      {/* 전체 페이지에서 플로팅 항상 보임 */}
      {open && !isDetailPage && (
        <div className="dropdown-menu" ref={dropdownRef}>
          {storeData.map((store, i) => (
            <div key={i} className="dropdown-item" onClick={() => handleStoreClick(store.name)}>
              {store.name}
            </div>
          ))}
        </div>
      )}

      <div
        className="floating-mascot"
        onClick={() => {
          if (isMobile) {
            handleFloatingClick();
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        <img
          src={isMobile ? "/img/icon/문자보내기.svg" : "/img/icon/top.svg"}
          className="happy-sotal"
          alt="플로팅버튼"
        />
      </div>

      {selectedStore && !selectedAction && (
        <div className="contact-choice-popup" ref={popupRef}>
          <h3>{selectedStore.name} 문의하기</h3>
          <div className="contact-options">
            <div className="option" onClick={() => setSelectedAction("call")}>
              <img src="/img/icon/전화걸기.svg" alt="전화" />
              <span>전화하기</span>
            </div>

            {reservableStores.includes(selectedStore.name) && isMobile && (
              <a
                href={`sms:${selectedStore.phone.replace(/[^0-9]/g, "")}`}
                className="option"
                onClick={handleClose}
              >
                <img src="/img/icon/문자보내기.svg" alt="문자" />
                <span>문자 보내기</span>
              </a>
            )}


          </div>
          <button className="close-btn" onClick={handleClose}>닫기</button>
        </div>
      )}

      {selectedStore && selectedAction === "call" && (
        <div className="call-popup" ref={popupRef}>
          <a
            href={`tel:${selectedStore.phone.replace(/[^0-9]/g, "")}`}
            className="call-button"
          >
            {selectedStore.phone} 로 전화 걸기
          </a>
          <button className="close-btn" onClick={handleClose}>닫기</button>
        </div>
      )}

      {/* {selectedStore && selectedAction === "message" && (
        <div className="message-popup" ref={popupRef}>
          <h3>{selectedStore.name}에 문자 보내기</h3>
          <a
            href={`sms:${selectedStore.phone.replace(/[^0-9]/g, "")}`}
            className="message-button"
          >
            문자 보내기
          </a>
          <button className="close-btn" onClick={handleClose}>닫기</button>
        </div>
      )} */}

    </div>
  );
}
