// src/components/SignUp.tsx
import React, { useState, useEffect } from "react"
import { auth, db } from "../../firebase"
import { createUserWithEmailAndPassword /*, sendEmailVerification */ } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import "./SignUp.css"
import { useNavigate } from "react-router-dom"

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ✅ 개인정보 동의 상태 & 모달 상태
  const [agree, setAgree] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  const navigate = useNavigate()

  const validatePhone = (value: string) => {
    const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)")
    } else {
      setPhoneError("")
    }
  }

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init("d8e76007c8b0148a086c37901f73bd54")
    }
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // 버튼 자체가 비활성화되지만, 혹시 모를 직접 제출 방지
    if (!agree) {
      setError("개인정보 수집 및 이용에 동의해야 회원가입이 가능합니다.")
      return
    }
    if (phoneError) {
      setError("전화번호 형식을 확인해주세요.")
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        email,
        nickname,
        phone,
        role: "user",
        createdAt: new Date(),
        // 필요한 경우 약관 동의 시각이나 버전을 함께 저장 가능
        agreedPrivacy: true,
        agreedAt: new Date(),
      })

      // await sendEmailVerification(user)
      setSuccess("회원가입이 완료되었습니다!")

      setEmail("")
      setPassword("")
      setNickname("")
      setPhone("")
      setAgree(false)
      navigate("/")
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("이미 가입된 이메일입니다.")
      } else if (err.code === "auth/invalid-email") {
        setError("이메일 형식이 올바르지 않습니다.")
      } else if (err.code === "auth/weak-password") {
        setError("비밀번호는 6자리 이상이어야 합니다.")
      } else {
        setError("회원가입 중 오류가 발생했습니다.")
      }
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "")
    if (numbersOnly.length < 4) return numbersOnly
    if (numbersOnly.length < 7) {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`
    }
    if (numbersOnly.length <= 11) {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7)}`
    }
    return numbersOnly
  }

  // 카카오 로직은 기존 그대로 보존 (주석 처리된 버튼도 유지)
  const handleKakaoLogin = () => {
    if (!window.Kakao) return
    window.Kakao.Auth.login({
      scope: "profile_nickname, account_email, ",
      success: async (authObj: any) => {
        try {
          window.Kakao.API.request({
            url: "/v2/user/me",
            success: async (res: any) => {
              const kakao_account = res.kakao_account
              const uid = res.id.toString()
              const email = kakao_account.email || ""
              const nickname = kakao_account.profile.nickname || ""
              const phone = ""

              await setDoc(doc(db, "users", uid), {
                email,
                nickname,
                phone,
                role: "user",
                createdAt: new Date(),
                kakao: true
              })

              alert("카카오 회원가입 완료! (Firestore에 저장됨)")
            },
            fail: (err: any) => {
              console.error("카카오 유저 정보 불러오기 실패", err)
            }
          })
        } catch (error) {
          console.error("카카오 회원가입 실패", error)
        }
      },
      fail: (err: any) => {
        console.error("카카오 로그인 실패", err)
      }
    })
  }

  // ✅ 폼 유효성: 동의해야 하고, 휴대폰 오류가 없어야 하며, 필수 필드가 채워져야 버튼 활성화
  const isFormValid =
    agree &&
    !phoneError &&
    nickname.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    phone.trim().length > 0

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        <div className="auth-image" />
        <div className="signup-text">회원가입</div>

        <form onSubmit={handleSignUp}>
          <input
            className="signup-input"
            type="text"
            placeholder="본인 이름"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <br />
          <input
            className="signup-input"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <input
            className="signup-input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <input
            className="signup-input"
            type="text"
            placeholder="전화번호 - 제외후 입력해주세요"
            value={phone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value)
              setPhone(formatted)
              validatePhone(formatted)
            }}
            required
          />
          <br />
          {phoneError && <p style={{ color: "red" }}>{phoneError}</p>}

          {/* ✅ 개인정보 동의 영역 */}
          <div className="agreement-row" style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0 16px" }}>
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label
              htmlFor="agree"
              style={{ userSelect: "none", fontSize: 14, color: "#000" }}
            >
              개인정보 수집 및 이용에 동의합니다.
            </label>
            <button
              type="button"
              className="link-like-button"
              onClick={() => setShowPolicyModal(true)}
              aria-haspopup="dialog"
              aria-controls="policy-modal"
            >
              상세보기
            </button>
          </div>

          <button type="submit" className="Buttons" disabled={!isFormValid}>
            회원가입
          </button>

          {/* <button type="button" onClick={handleKakaoLogin} className="kakao">
            카카오로 회원가입
          </button> */}
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>

      {/* ✅ 약관 모달 */}
      {showPolicyModal && (
        <div
          id="policy-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-modal-title"
          className="modal-overlay"
          onClick={() => setShowPolicyModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "720px",
              maxHeight: "80vh",
              overflow: "auto",
              borderRadius: "12px",
              padding: "24px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 id="policy-modal-title" style={{ margin: 0 }}>개인정보 수집 및 이용 동의</h3>

            </div>

            {/* 여기에 원하는 동의 전문을 넣으면 됩니다. */}
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: "14px" }}>
{`
(운영자: 합천군청, 쇼핑몰 명: 우리마을삼가)

[안내]
해당 서식은 공정거래위원회 전자상거래 표준약관을 바탕으로 하였으며, 쇼핑몰 운영형태에 따라 수정이 필요할 수 있습니다. 적용 전 운영 사항을 확인하고 관련 법령을 감안하여 적절히 반영하시기 바랍니다.

제1조(목적)

이 약관은 합천군청(전자상거래 사업자)이 운영하는 삼가 홈페이지(이하 “몰”)에서 제공하는 인터넷 관련 서비스(이하 “서비스”)를 이용함에 있어 “몰”과 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
※ PC통신, 무선 등을 이용하는 전자상거래에도 그 성질에 반하지 않는 한 준용합니다.

제2조(정의)

“몰”이란 합천군청이 재화 또는 용역(이하 “재화 등”)을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 이를 운영하는 사업자를 의미합니다.

“이용자”란 “몰”에 접속하여 이 약관에 따라 “몰”이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.

“회원”이란 “몰”에 회원등록을 한 자로서, 계속적으로 “몰”이 제공하는 서비스를 이용할 수 있는 자를 말합니다.

“비회원”이란 회원에 가입하지 않고 “몰”이 제공하는 서비스를 이용하는 자를 말합니다.

제3조(약관 등의 명시와 설명 및 개정)

“몰”은 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지(소비자 불만 처리 주소 포함), 전화번호·모사전송번호·전자우편주소, 사업자등록번호, 통신판매업 신고번호, 개인정보관리책임자 등을 이용자가 쉽게 알 수 있도록 삼가 홈페이지 초기화면에 게시합니다. 약관 전문은 연결화면으로 볼 수 있게 할 수 있습니다.

“몰”은 이용자가 약관에 동의하기 전에 청약철회·배송책임·환불조건 등 중요한 내용을 별도 연결화면 또는 팝업으로 제공하여 이용자의 확인을 받아야 합니다.

“몰”은 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관계 법령을 위배하지 않는 범위에서 약관을 개정할 수 있습니다.

약관을 개정할 경우 적용일자 및 개정사유를 명시하여 현행 약관과 함께 적용일자 7일 전부터 적용 전일까지 “몰” 초기화면에 공지합니다. 이용자에게 불리한 변경은 최소 30일 이상 유예합니다. 이 경우 개정 전·후 내용을 비교하여 알기 쉽게 표시합니다.

개정약관은 적용일자 이후 체결되는 계약에 적용되며, 그 이전 계약에는 종전 약관이 적용됩니다. 다만 이용자가 공지기간 내 개정약관 적용을 요청하고 “몰”이 동의한 경우 개정약관을 적용합니다.

이 약관에서 정하지 아니한 사항과 해석은 관련 법령 및 상관례에 따릅니다.

제4조(서비스의 제공 및 변경)

“몰”은 다음 업무를 수행합니다.
(1) 재화 또는 용역에 대한 정보 제공 및 구매계약의 체결
(2) 구매계약이 체결된 재화 또는 용역의 배송
(3) 기타 “몰”이 정하는 업무

품절 또는 기술적 사양 변경 시 장차 체결될 계약에 의해 제공할 재화/용역의 내용을 변경할 수 있으며, 이 경우 변경내용 및 제공일자를 즉시 공지합니다.

이미 체결한 서비스 내용을 품절·사양변경 등으로 변경할 경우 그 사유를 지체 없이 이용자에게 통지합니다.

전항 사유로 이용자에게 손해가 발생한 경우 “몰”은 배상합니다. 다만 고의·과실이 없음을 입증한 경우는 예외입니다.

제5조(서비스의 중단)

정보통신설비의 보수·교체·고장, 통신두절 등의 사유가 발생한 경우 서비스 제공을 일시 중단할 수 있습니다.

이로 인한 손해에 대하여 “몰”은 배상합니다. 단, 고의·과실이 없음을 입증한 경우는 예외입니다.

사업종목 전환·포기·통합 등으로 서비스를 제공할 수 없게 되는 경우 제8조에 따라 통지하고 당초 제시한 조건에 따라 보상합니다. 보상기준 고지 미이행 시 적립금 등은 통용되는 가치에 상응하는 현물 또는 현금으로 지급합니다.

제6조(회원가입)

이용자는 “몰”이 정한 양식에 따라 회원정보를 기입하고 본 약관에 동의함으로써 회원가입을 신청합니다.

“몰”은 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
(1) 제7조 제3항에 따라 회원자격을 상실한 적이 있는 자(단 재가입 승낙 시 예외)
(2) 등록 내용에 허위·누락·오기가 있는 경우
(3) 기술상 회원 등록에 현저한 지장이 있다고 판단되는 경우

회원가입 성립시기는 “몰”의 승낙이 회원에게 도달한 시점으로 합니다.

회원은 등록사항 변경 시 상당한 기간 내 “몰”에 회원정보 수정 등으로 알려야 합니다.

제7조(회원 탈퇴 및 자격 상실 등)

회원은 언제든지 탈퇴를 요청할 수 있으며 “몰”은 즉시 처리합니다.

회원이 다음 각 호에 해당하면 회원자격을 제한·정지할 수 있습니다.
(1) 가입 시 허위 내용 등록
(2) 대금 등 채무를 기일에 지급하지 않는 경우
(3) 타인 이용 방해 또는 정보 도용 등 전자상거래 질서 위협
(4) 법령·약관 또는 공서양속에 반하는 행위

제한·정지 후 동일 행위가 2회 이상 반복되거나 30일 내 시정되지 않으면 자격을 상실시킬 수 있습니다.

자격 상실 시 회원등록을 말소하며, 사전 30일 이상 소명기회를 부여하고 통지합니다.

제8조(회원에 대한 통지)

개별 통지는 회원이 지정한 전자우편 주소로 할 수 있습니다.

불특정다수에 대한 통지는 1주일 이상 게시판 게시로 갈음할 수 있습니다. 다만 거래에 중대한 영향이 있는 사항은 개별 통지합니다.

제9조(구매신청 및 개인정보 제공 동의 등)

이용자는 “몰”에서 아래 방법에 따라 구매를 신청합니다. “몰”은 신청 과정에서 다음 사항을 알기 쉽게 제공합니다.
(1) 재화 등의 검색 및 선택
(2) 수령인 성명·주소·전화번호·전자우편(또는 휴대전화) 입력
(3) 약관, 청약철회 제한, 배송료·설치비 등 비용 부담 확인
(4) 약관 동의 및 전 항목 확인/거부 표시(예: 클릭)
(5) 구매신청 및 확인, “몰”의 확인에 대한 동의
(6) 결제방법 선택

제3자에게 구매자 개인정보 제공이 필요한 경우, 제공받는 자/목적/항목/보유·이용기간을 알리고 동의를 받아야 합니다(변경 시에도 동일).

제3자에게 개인정보 처리를 위탁하는 경우, 수탁자/업무내용을 알리고 동의를 받아야 합니다(변경 시에도 동일). 다만 서비스 이행 및 편의증진을 위한 경우 「정보통신망법」이 정한 방법으로 개인정보처리방침 고지로 갈음할 수 있습니다.

제10조(계약의 성립)

“몰”은 다음 각 호에 해당하면 승낙하지 않을 수 있습니다. 미성년자와의 계약은 법정대리인 동의가 없으면 취소 가능함을 고지합니다.
(1) 신청 내용에 허위·누락·오기가 있는 경우
(2) 청소년보호법상 금지 재화·용역 구매
(3) 기술상 승낙이 현저히 지장 있는 경우

“몰”의 승낙이 수신확인통지 형태로 도달한 시점에 계약이 성립합니다.

승낙의 의사표시에는 신청내역 확인 및 판매가능 여부, 정정·취소 관련 정보가 포함됩니다.

제11조(지급방법)

이용자는 다음 중 가능한 방법으로 대금을 지급할 수 있으며, “몰”은 이에 수수료를 추가 징수하지 않습니다.
계좌이체, 각종 카드결제, 무통장입금, 전자화폐, 대금상환, 포인트 결제, 상품권 결제, 기타 전자적 지급방법 등.

제12조(수신확인통지·구매신청 변경 및 취소)

“몰”은 구매신청이 있으면 수신확인통지를 합니다.

이용자는 통지 수령 후 즉시 정정·취소를 요청할 수 있으며, “몰”은 배송 전 요청 시 지체 없이 처리합니다. (이미 대금 지급 시 제15조 적용)

제13조(재화 등의 공급)

별도 약정이 없으면 청약일로부터 7일 이내 배송에 필요한 조치를 합니다(대금 수령 시 3영업일 이내). 진행상황을 확인할 수 있도록 적절한 조치를 합니다.

배송수단·비용부담자·기간을 명시하며, 약정기간 초과 시 손해를 배상합니다. 다만 고의·과실이 없음을 입증한 경우는 예외입니다.

제14조(환급)

품절 등으로 제공 불가 시 지체 없이 통지하고, 선결제한 경우 3영업일 이내 환급 또는 환급에 필요한 조치를 합니다.

제15조(청약철회 등)

이용자는 법령이 정한 서면 수령일(또는 공급일)부터 7일 이내 청약을 철회할 수 있습니다. 법령에 달리 정함이 있는 경우 그에 따릅니다.

다음의 경우 반품·교환이 제한됩니다.
(1) 이용자 책임으로 멸실·훼손(내용 확인 위한 포장 훼손 제외)
(2) 사용·일부 소비로 가치 현저히 감소
(3) 시간 경과로 재판매 곤란할 정도로 가치 감소
(4) 복제 가능 재화의 포장 훼손

전항 2)~4)에도 불구하고, 제한 사실을 명기하지 않았거나 시용상품 제공 등 조치가 없었다면 제한되지 않습니다.

표시·광고 내용 또는 계약 내용과 다르게 이행된 때에는 공급받은 날부터 3개월, 그 사실을 안 날부터 30일 이내 청약철회가 가능합니다.

제16조(청약철회 등의 효과)

반환받은 날부터 3영업일 이내 대금을 환급합니다. 지연 시 시행령이 정한 지연이자를 지급합니다.

신용카드·전자화폐로 지급한 경우, 해당 사업자에게 청구 정지 또는 취소를 요청합니다.

청약철회에 따른 반환비용은 이용자가 부담합니다. 다만 표시·광고 내용과 다르거나 계약과 다르게 이행된 경우에는 “몰”이 부담합니다.

수령 시 발송비를 이용자가 부담한 경우, 철회 시 비용 부담 주체를 명확히 표시합니다.

제17조(개인정보보호)

“몰”은 서비스 제공을 위한 최소한의 개인정보만 수집합니다.

회원가입 시 구매계약 이행에 필요한 정보를 미리 수집하지 않습니다. 다만 법령상 본인확인이 필요한 경우 최소한의 특정정보를 수집할 수 있습니다.

개인정보 수집·이용 시 목적을 고지하고 동의를 받습니다.

수집한 개인정보를 목적 외 이용 또는 제3자 제공 시 이용단계에서 목적을 고지하고 동의를 받습니다(법령 예외 제외).

동의가 필요한 경우, 개인정보관리책임자의 신원(소속·성명·연락처), 수집·이용 목적, 제3자 제공 사항(제공받는 자·목적·항목)을 미리 명시 또는 고지합니다. 이용자는 언제든지 동의를 철회할 수 있습니다.

이용자는 자신의 개인정보 열람·정정을 요구할 수 있고, “몰”은 지체 없이 필요한 조치를 합니다. 정정 완료 전까지 당해 개인정보는 이용하지 않습니다.

“몰”은 개인정보 취급자를 최소화하고, 분실·도난·유출·동의 없는 제3자 제공·변조 등으로 인한 손해에 대하여 책임을 집니다.

수집 목적 또는 제공 목적 달성 시 지체 없이 파기합니다.

동의란은 미리 선택되지 않도록 하며, 동의 거절 시 제한되는 서비스를 구체적으로 명시합니다. 필수항목이 아닌 개인정보 동의 거절을 이유로 회원가입 등 서비스 제공을 제한하지 않습니다.

제18조(“몰”의 의무)

법령·약관 및 공서양속에 반하는 행위를 하지 않으며, 지속적·안정적으로 재화·용역을 제공하기 위해 최선을 다합니다.

이용자의 개인정보(신용정보 포함) 보호를 위한 보안시스템을 갖춥니다.

부당한 표시·광고로 이용자에게 손해가 발생한 경우 배상책임을 집니다.

이용자가 원하지 않는 영리 목적 광고성 전자우편을 발송하지 않습니다.

제19조(회원의 ID 및 비밀번호에 대한 의무)

제17조의 경우를 제외하고 ID·비밀번호 관리책임은 회원에게 있습니다.

회원은 자신의 ID·비밀번호를 제3자에게 이용하게 해서는 안 됩니다.

도난·무단사용 사실을 인지한 경우 즉시 “몰”에 통보하고 안내에 따라야 합니다.

제20조(이용자의 의무)

허위등록, 타인정보 도용, 정보변경, 승인되지 않은 정보 송신·게시, 지식재산권 침해, 명예훼손·업무방해, 공서양속 위반 정보 공개·게시 등의 행위를 해서는 안 됩니다.

제21조(연결 “몰”과 피연결 “몰”의 관계)

상위 “몰”과 하위 “몰”이 하이퍼링크 등으로 연결된 경우 전자를 연결 “몰”, 후자를 피연결 “몰”이라 합니다.

연결 “몰”이 피연결 “몰”의 독자적 거래에 대해 보증책임을 지지 않는다는 뜻을 초기화면 또는 연결 시점 팝업으로 명시한 경우 그 거래에 대한 보증책임을 지지 않습니다.

제22조(저작권의 귀속 및 이용제한)

“몰”이 작성한 저작물의 저작권 기타 지적재산권은 “몰”에 귀속합니다.

이용자는 “몰”의 사전 승낙 없이 이를 영리 목적으로 복제·송신·출판·배포·방송하거나 제3자에게 이용하게 해서는 안 됩니다.

“몰”이 이용자에게 귀속된 저작권을 사용하는 경우 당해 이용자에게 통보합니다.

제23조(분쟁해결)

“몰”은 피해보상처리기구를 설치·운영하여 정당한 의견·불만을 반영하고 피해를 보상합니다.

불만사항은 우선적으로 처리하고, 신속처리가 곤란한 경우 사유와 일정을 통보합니다.

전자상거래 분쟁과 관련하여 이용자가 피해구제를 신청하는 경우 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.

제24조(재판권 및 준거법)

소송은 제소 당시 이용자의 주소를 관할하는 지방법원의 전속관할로 합니다. 주소가 없거나 불명확·외국거주인 경우 민사소송법상 관할법원에 제기합니다.

전자상거래 소송에는 대한민국 법을 적용합니다.`}
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" onClick={() => setShowPolicyModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
