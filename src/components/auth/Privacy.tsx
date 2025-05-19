import React from "react"

export default function PrivacyPolicy() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formattedDate = `${year}년 ${month}월 ${day}일`

    return (
        <div className="privacy-policy" style={{ padding: "40px", lineHeight: "1.7", fontSize: "16px" }}>
            <h1>개인정보 처리방침</h1>

            <h2>1. 수집하는 개인정보 항목</h2>
            <p>
                삼가한우는 회원가입, 예약, 단골등록 등의 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
                <br />
                - 필수항목: 이름, 이메일, 비밀번호 <br />
                - 선택항목: 전화번호 (예약 시 사용), 리뷰 작성 내용 <br />
                - 자동수집항목: 접속 로그, 쿠키, 접속 IP 등
            </p>

            <h2>2. 개인정보 수집 및 이용 목적</h2>
            <p>
                수집된 개인정보는 다음 목적을 위해 사용됩니다:
                <br />
                - 회원 관리 (가입, 로그인, 단골 등록 기능 제공) <br />
                - 가게 리뷰 작성 및 확인 <br />
                - 예약 신청 확인 및 알림 전송 <br />
                - 서비스 개선을 위한 분석
            </p>

            <h2>3. 개인정보 보유 및 이용기간</h2>
            <p>
                - 회원 탈퇴 시 또는 수집 목적 달성 시 지체 없이 파기
                <br />
                - 단, 관련 법령에 따라 보관이 필요한 경우 일정 기간 동안 보관
            </p>
            <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                    <tr>
                        <th>항목</th>
                        <th>보관기간</th>
                        <th>근거법령</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>계약 또는 청약철회 기록</td>
                        <td>5년</td>
                        <td>전자상거래법</td>
                    </tr>
                    <tr>
                        <td>소비자 불만 및 분쟁처리 기록</td>
                        <td>3년</td>
                        <td>전자상거래법</td>
                    </tr>
                </tbody>
            </table>

            <h2>4. 개인정보 제3자 제공</h2>
            <p>
                삼가한우는 원칙적으로 개인정보를 외부에 제공하지 않습니다.
                <br />
                단, 이용자의 동의가 있거나 법령에 의한 경우에는 예외로 합니다.
            </p>

            <h2>5. 개인정보 처리 위탁</h2>
            <p>
                현재 개인정보 처리를 위탁하는 대상은 없습니다.
                <br />
                향후 위탁이 필요한 경우 사전 고지 후 동의를 받겠습니다.
            </p>

            <h2>6. 이용자의 권리와 그 행사 방법</h2>
            <p>
                - 언제든지 자신의 개인정보 열람, 수정, 삭제, 처리 정지 요청 가능 <br />
                - 이메일 또는 마이페이지에서 직접 변경 가능
            </p>

            <h2>7. 개인정보의 파기절차 및 방법</h2>
            <p>
                - 회원 탈퇴 시 수집된 개인정보는 즉시 또는 일정 보유기간 후 안전하게 파기 <br />
                - 전자파일: 복구 불가능한 방식으로 삭제 <br />
                - 출력물: 분쇄 또는 소각
            </p>

            <h2>8. 개인정보 보호책임자</h2>
            <p>
                - 이름: 합천군 도시재생지원 센터 <br />
                - 전화번호: 055-933-8330 <br />
                - 담당업무: 개인정보 보호 총괄 책임
            </p>

            <h2>9. 기타</h2>
            <p>
                본 개인정보처리방침은 관련 법령 또는 내부 정책에 따라 변경될 수 있으며, 변경 시 웹사이트에 공지합니다.
                <br />
                <strong>시행일자: {formattedDate}</strong>
            </p>
        </div>
    )
}
