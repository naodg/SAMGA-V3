import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "vilage-info-page", children: [_jsx("div", { className: "vilage-images", children: isMobile ? (_jsx("img", { src: "/samga/information/\uC18C\uD0C8\uC774\uC18C\uAC1Cm.jpg", alt: "\uC18C\uD0C8\uC774 \uC18C\uAC1C \uBAA8\uBC14\uC77C" })) : (_jsx("img", { src: "/samga/information/\uC18C\uD0C8\uC774\uC18C\uAC1Cpc.jpg", alt: "\uC18C\uD0C8\uC774 \uC18C\uAC1C PC" })) }), _jsx("a", { href: "https://www.kogl.or.kr/recommend/recommendDivView.do?recommendIdx=50587&division=img", target: "_blank", rel: "noopener noreferrer", className: "sotal-download-button", children: "\uC18C\uD0C8\uC774 \uC774\uBBF8\uC9C0 \uB2E4\uC6B4\uBC1B\uAE30" })] }));
}
