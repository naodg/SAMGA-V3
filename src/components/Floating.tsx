import React, { useState } from "react";
import "./Floating.css";

export default function Floating() {
    const [open, setOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [guestCount, setGuestCount] = useState<number>(1);

    const reservableStores = [
        "대가식육식당",
        "대가한우",
        "대산식육식당",
        "대웅식육식당",
        "태영한우",
    ];

    const times = ["11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00"];

    const handleStoreClick = (store: string) => {
        setSelectedStore(store);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleReservation = () => {
        if (!selectedDate || !selectedTime || !guestCount) {
            alert("날짜, 시간, 인원수를 모두 선택해주세요!");
            return;
        }
        alert(`${selectedStore} 예약 완료: ${selectedDate} ${selectedTime}, ${guestCount}명`);
        setSelectedStore(null); // 팝업 닫기
    };

    return (
        <div className="floating-wrapper">
            {/* 가게 리스트 드롭다운 */}
            {open && (
                <div className="dropdown-menu">
                    {reservableStores.map((store, i) => (
                        <div key={i} className="dropdown-item" onClick={() => handleStoreClick(store)}>
                            {store}
                        </div>
                    ))}
                </div>
            )}

            {/* 예약 플로팅 버튼 */}
            <div className="floating-mascot" onClick={() => setOpen(!open)}>
                <img src="/SAMGA-V3/img/icon/message.svg" className="happy-sotal" />
                
            </div>

            {/* 예약 팝업 */}
            {selectedStore && (
                <div className="reservation-popup">
                    <h3>{selectedStore} 예약하기</h3>

                    <div className="popup-row">
                        <label>날짜 선택:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input-date"
                        />
                    </div>

                    <label>시간 선택:</label>
                    <div className="time-row">
                        <div className="time-buttons">
                            {times.map((time, i) => (
                                <button
                                    key={i}
                                    className={selectedTime === time ? "active" : ""}
                                    onClick={() => setSelectedTime(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="popup-row">
                        <label>인원 수:</label>
                        <select value={guestCount} onChange={(e) => setGuestCount(parseInt(e.target.value))}>
                            {[...Array(14)].map((_, i) => {
                                const count = i + 1;
                                return (
                                    <option key={count} value={count}>
                                        {count <= 10 ? `${count}명` : `단체 (${count}명)`}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="popup-buttons">
                        <button onClick={handleReservation}>예약하기</button>
                        <button onClick={() => setSelectedStore(null)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}
