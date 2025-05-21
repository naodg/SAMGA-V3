import React, { useState } from "react"
import "./Floating.css"

export default function Floating() {
    const [open, setOpen] = useState(false)


    const reservableStores = [
        "대가식육식당",
        "대가한우",
        "대산식육식당",
        "대웅식육식당",
        "태영한우"
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
                <img src="/SAMGA-V3/img/logo/행복한 소탈이.svg" className="happy-sotal"/>
                예약
            </div>
        </div>
    )
}