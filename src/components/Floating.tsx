import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { storeData } from "../data/storeData";
import "./Floating.css";

export default function Floating() {
  const [open, setOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<typeof storeData[0] | null>(null);
  const [selectedAction, setSelectedAction] = useState<"call" | "message" | null>(null);
  const [messageText, setMessageText] = useState<string>("");

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
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        setSelectedStore(null);
        setSelectedAction(null);
        setMessageText("");
      }
    };

    if (selectedStore) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedStore]);

  const handleStoreClick = (storeName: string) => {
    const found = storeData.find((store) => store.name === storeName);
    if (found) {
      setSelectedStore(found);
      setSelectedAction(null);
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

  return (
    <div className="floating-wrapper">
      {/* 전체 페이지에서 플로팅 항상 보임 */}
      {open && !isDetailPage && (
        <div className="dropdown-menu">
          {storeData.map((store, i) => (
            <div key={i} className="dropdown-item" onClick={() => handleStoreClick(store.name)}>
              {store.name}
            </div>
          ))}
        </div>
      )}

      <div className="floating-mascot" onClick={handleFloatingClick}>
        <img src="/SAMGA-V3/img/icon/문자보내기.svg" className="happy-sotal" />
      </div>

      {selectedStore && !selectedAction && (
        <div className="contact-choice-popup" ref={popupRef}>
          <h3>{selectedStore.name} 문의하기</h3>
          <div className="contact-options">
            <div className="option" onClick={() => setSelectedAction("call")}>
              <img src="/SAMGA-V3/img/icon/전화걸기.svg" alt="전화" />
              <span>전화하기</span>
            </div>

            {reservableStores.includes(selectedStore.name) && (
              <div className="option" onClick={() => setSelectedAction("message")}>
                <img src="/SAMGA-V3/img/icon/문자보내기.svg" alt="문자" />
                <span>문자 보내기</span>
              </div>
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

      {selectedStore && selectedAction === "message" && (
        <div className="message-popup" ref={popupRef}>
          <h3>{selectedStore.name}에 문자 보내기</h3>
          <textarea
            placeholder="문의하실 내용을 입력해주세요."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="message-textarea"
          />
          <div className="popup-buttons">
            <button
              onClick={() => {
                alert(`${selectedStore.name}에 보낸 문자:\n\n${messageText}`);
                handleClose();
              }}
            >
              보내기
            </button>
            <button onClick={handleClose}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
}
