import { useState } from "react"
import { db, auth } from "../../firebase"
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import './ReviewWritePage.css'
import { storeData } from "../../data/storeData"

// 예: store 목록은 이렇게 되어 있다고 가정


export default function ReviewWritePage() {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [selectedStoreId, setSelectedStoreId] = useState("") // 기본값 설정
    const navigate = useNavigate()

    const [star, setStar] = useState(0)

    const storeList = storeData.map((store, index) => ({
        name: store.name,
        id: `store${index + 1}`
    }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const user = auth.currentUser



        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }


        // 닉네임 불러오기
        const userDoc = await getDoc(doc(db, "users", user.uid))
        const nickname = userDoc.exists() ? userDoc.data().nickname : "알 수 없음"

        try {
            await addDoc(collection(db, "reviews"), {
                title,
                content,
                star,
                userId: user.uid,
                nickname,
                storeId: selectedStoreId,
                createdAt: serverTimestamp()
            })
            alert("리뷰 저장 완료!")
            navigate("/review")
        } catch (err) {
            console.error("리뷰 저장 실패:", err)
            alert("저장 중 오류가 발생했습니다.")
        }
    }

    return (
        <div className="review-write-page">
            <h2>리뷰 쓰기</h2>

            <form onSubmit={handleSubmit}>
                <div className="store-select-row">
                    <label htmlFor="store-select">가게 선택:</label>
                    <select
                        id="store-select"
                        value={selectedStoreId}
                        onChange={(e) => setSelectedStoreId(e.target.value)}
                        className="review-input"
                        required
                    >
                        <option value="" disabled> - 가게를 선택해주세요 - </option>
                        {storeList.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="star-rating">
                    {[...Array(5)].map((_, i) => {
                        const value = (i + 1) * 1
                        let imgSrc = ""

                        if (star >= value) {
                            imgSrc = "/SAMGA-V2/img/icon/단골등록해제.svg" // ⭐️ 가득 찬 별
                        } else {
                            imgSrc = "/SAMGA-V2/img/icon/단골등록.svg" // ⭐️ 빈 별
                        }

                        return (
                            <img
                                key={i}
                                src={imgSrc}
                                alt={`${value}점`}
                                className="star-svg"
                                onClick={() => setStar(value)}
                            />
                        )
                    })}
                    <span className="star-value">{star}점</span>
                </div>


                {/* <input
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="review-input"
                    required
                /> */}
                <textarea
                    placeholder="내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="review-textarea"
                    required
                />

                <div className="review-submit-wrapper">
                    <button type="submit" className="review-submit-button">리뷰 저장</button>
                </div>
            </form>
        </div>
    )
}
