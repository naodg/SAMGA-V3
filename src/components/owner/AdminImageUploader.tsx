import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject, getMetadata, updateMetadata } from "firebase/storage"
import { storage, auth } from "../../firebase"
import "./AdminImageUploader.css"

export default function AdminImageUploader() {
  const { storeId } = useParams<{ storeId: string }>()
  const [tab, setTab] = useState("menu")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageData, setImageData] = useState<{ url: string; description: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState("")
  const [editingDescriptions, setEditingDescriptions] = useState<Record<string, string>>({})
  const [editingStates, setEditingStates] = useState<Record<string, boolean>>({})



  const handleUpdateDescription = async (url: string) => {
  try {
    const newDescription = editingDescriptions[url]
    const filePath = decodeURIComponent(url.split("/o/")[1].split("?")[0])
    const fileRef = ref(storage, filePath)

    await updateMetadata(fileRef, {
      customMetadata: {
        description: newDescription || "설명 없음"
      }
    })

    alert("설명 업데이트 완료!")

    // 수정모드 해제
    setEditingStates((prev) => ({ ...prev, [url]: false }))
    fetchImagesFromStorage()
  } catch (error) {
    console.error("설명 업데이트 실패", error)
    alert("설명 업데이트 중 오류 발생")
  }
}

  const fetchImagesFromStorage = async () => {
  if (!storeId) return
  setLoading(true)

  const pathRef = ref(storage, `stores/${storeId}/${tab}`)
  try {
    const res = await listAll(pathRef)

    const items = await Promise.all(
      res.items.map(async (item) => {
        const url = await getDownloadURL(item)
        const metadata = await getMetadata(item)
        const description = metadata.customMetadata?.description || "설명 없음"
        return { url, description }
      })
    )

    setImageData(items)
  } catch (error) {
    console.error("이미지 불러오기 실패", error)
    setImageData([])
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchImagesFromStorage()
  }, [storeId, tab])

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

      const metadata = {
          contentType: file.type,
          customMetadata: {
            description: description || "설명 없음"
          }
        }

    await uploadBytes(storageRef, file, metadata)
      alert("업로드 완료!")
      setFile(null)
      fetchImagesFromStorage()

    } catch (err) {
      console.error(err)
      alert("업로드 중 오류가 발생했어요.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (url: string) => {
    const confirmDelete = window.confirm("정말로 이 이미지를 삭제하시겠습니까?")
    if (!confirmDelete) return

    try {
      console.log("현재 로그인된 유저:", auth.currentUser?.uid);
      const pathStart = `https://firebasestorage.googleapis.com/v0/b/`
      // const filePath = decodeURIComponent(url.split("?alt=")[0].replace(pathStart, ""))
      const filePath = decodeURIComponent(
        url.split("/o/")[1].split("?")[0]
      ); // ✅ 'stores/store1/menu/대가1호점_1.jpg'

      console.log("path:", filePath);
      const storageRef = ref(storage, filePath)
      await deleteObject(storageRef)
      alert("삭제 완료!")
      fetchImagesFromStorage()
    } catch (err) {
      console.error(err)
      alert("삭제 실패")
    }
  }

  if (!storeId) return <div>가게 정보를 불러오는 중입니다...</div>

  return (
    <div className="admin-uploader-container">
      <h2>이미지 업로드 및 관리</h2>
      <div className="tab-select">
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
      <input
          type="text"
          placeholder="이미지 설명을 입력하세요"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="description-input"
        />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "업로드 중..." : "업로드"}
      </button>

      <hr />

      <div className="uploaded-image-list">
        {loading ? (
          <p>이미지 불러오는 중...</p>
        ) : imageData.length === 0 ? (
          <p>이미지가 없습니다.</p>
        ) : (
          imageData.map(({ url, description }, idx) => {
          const isEditing = editingStates[url] || false
          const currentValue = editingDescriptions[url] ?? description

          return (
            <div key={idx} className="uploaded-image-item">
              <img className="preview-image" src={url} alt="업로드 이미지" />

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="edit-controls">
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) =>
                      setEditingDescriptions((prev) => ({
                        ...prev,
                        [url]: e.target.value
                      }))
                    }
                    className="edit-input"
                  />
                  <button
                    className="edit-confirm-button image-action-button"
                    onClick={() => handleUpdateDescription(url)}
                  >
                    수정
                  </button>
                </div>
              </div>

              <button onClick={() => handleDelete(url)}>삭제</button>
            </div>
          )
        })


        )}
      </div>
    </div>
  )
}
