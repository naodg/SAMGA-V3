import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage, auth } from "../../firebase"
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import "./AdminImageUploader.css"

export default function AdminImageUploader() {
  const { storeId } = useParams<{ storeId: string }>()
  const [tab, setTab] = useState("menu")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser
      if (!user) {
        alert("로그인 후 이용해주세요.")
        return
      }

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        alert("유저 정보가 없습니다.")
        return
      }

      const data = userDoc.data()
      if (data.role !== "owner") {
        alert("사장님 계정만 업로드할 수 있습니다.")
        return
      }

      if (!storeId || data.storeId !== storeId) {
        alert("해당 가게에 대한 권한이 없습니다.")
      }
    }

    fetchUser()
  }, [storeId])

  const handleUpload = async () => {
    if (!file || !storeId) {
      alert("파일 또는 가게 정보가 없습니다.")
      return
    }

    setUploading(true)

    try {
      const sanitizedFileName = file.name.replaceAll("/", "_").replaceAll(" ", "_")
      const sanitizedStoreId = storeId.replaceAll("/", "_")
      const path = `stores/${sanitizedStoreId}/${tab}/${sanitizedFileName}`
      const storageRef = ref(storage, path)

      console.log("업로드 대상 경로:", path)

      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)

      await addDoc(collection(db, "stores", sanitizedStoreId, tab), {
        url,
        createdAt: serverTimestamp(),
      })

      alert("업로드 완료!")
      setFile(null)
    } catch (err) {
      console.error(err)
      alert("업로드 중 오류가 발생했어요.")
    } finally {
      setUploading(false)
    }
  }

  if (!storeId) return <div>가게 정보를 불러오는 중입니다...</div>

  return (
    <div className="admin-uploader-container">
      <div>
        <label>탭 선택: </label>
        <select value={tab} onChange={(e) => setTab(e.target.value)}>
          <option value="menu">메뉴</option>
          <option value="side">상차림</option>
          <option value="amenities">편의시설</option>
        </select>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={uploading}
      />

      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "업로드 중..." : "업로드"}
      </button>
    </div>
  )
}
