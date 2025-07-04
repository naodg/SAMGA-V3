// AdminDashboard.tsx
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { auth, db } from "../../firebase"
import { doc, getDoc, getDocs, collection, } from "firebase/firestore"
import './AdminDashboard.css'
import { storeData } from "../../data/storeData"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { onAuthStateChanged } from "firebase/auth";


export default function AdminDashboard() {
  const { storeId } = useParams() // store1 등
  const [userStoreId, setUserStoreId] = useState("")
  const [favorites, setFavorites] = useState<any[]>([])
  const [authChecked, setAuthChecked] = useState(false)
  const [UserType, setUserType] = useState<'owner' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)

  const storeIndex = parseInt((storeId || "").replace("store", "")) - 1
  const storeName = storeData[storeIndex]?.name || storeId

  useEffect(() => {
    const fetch = async () => {
      const user = auth.currentUser
      if (!user) return

      const userSnap = await getDoc(doc(db, "users", user.uid))
      if (!userSnap.exists()) return

      const userData = userSnap.data()
      setUserStoreId(userData.storeId || "")

      if (userData.role === "owner" && userData.storeId === storeId) {
        const favSnap = await getDocs(collection(db, "favorites", storeId, "users"))
        setFavorites(favSnap.docs.map((d) => d.data()))
      }

      setAuthChecked(true)
    }
    console.log(favorites)

    fetch()
  }, [storeId])


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserType(data.role === "owner" ? "owner" : "user");
        }
      }
      setLoading(false); // ✅ 항상 마지막에 로딩 false!
    });

    return () => unsubscribe(); // ✅ cleanup
  }, []);



  // 엑셀로 다운로드
  const handleDownload = () => {
    // favorites 배열을 시트로 변환
    const worksheet = XLSX.utils.json_to_sheet(favorites)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Favorites")

    // 파일로 변환
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" })

    // 저장
    saveAs(blob, `${storeName}_단골리스트.xlsx`)
  }

  if (!authChecked) return <p>로딩 중...</p>
  if (userStoreId !== storeId) return <p>해당 가게에 대한 접근 권한이 없습니다.</p>

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <div className="admin-title">
          <img src="/img/icon/수퍼히어로랜딩.svg" alt="캐릭터" className="admin-icon" />
          <span>{storeName} 단골 리스트</span>
        </div>

      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>전화번호</th>
            <th>이메일</th>
            <th>
              <img src="/img/icon/다운로드.svg" alt="다운로드" className="download-icon" onClick={handleDownload} />
            </th>
          </tr>
        </thead>
        <tbody>
          {favorites.map((f, i) => (
            <tr key={i}>
              <td>{f.nickname}</td>
              <td>{f.phone}</td>
              <td>{f.email}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  )
}
