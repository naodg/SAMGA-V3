import React, { useState } from "react"
import "./Floating.css"

export default function Floating() {
    const [open, setOpen] = useState(false)


    const reservableStores = [
        "대가1호점",
        "대가한우",
        "대산식육식당",
        "상구한우",
        "삼가명품한우"
    ]

    return (
        <div className="floating-wrapper">
            {/* 드롭다운 메뉴 */}
            {open && (
                <div className="dropdown-menu">
                    {reservableStores.map((store, i) => (
                        <div key={i} className="dropdown-item">
                            {store}
                        </div>
                    ))}
                </div>
            )}

            <div className="floating-mascot" onClick={() => setOpen(!open)}>
                예약
            </div>
        </div>
    )
}