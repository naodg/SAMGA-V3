import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Myinfo.css";

export default function Myinfo() {
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setNickname(data.nickname || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      nickname,
      phone,
    });

    alert("정보가 수정되었습니다!");
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="myinfo-container">
      <h2>내 정보 수정</h2>
      <div className="form-group">
        <label>이름</label>
        <input className="myinfo-input" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </div>
      <div className="form-group">
        <label>전화번호</label>
        <input className="myinfo-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <button className="myinfo-button" onClick={handleUpdate}>저장</button>
    </div>
  );
}