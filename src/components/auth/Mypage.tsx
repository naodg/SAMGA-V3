import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Mypage() {
  const [userType, setUserType] = useState<'owner' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserType(data.userType === 'owner' ? 'owner' : 'user');
      }

      setLoading(false);
    };

    fetchUserType();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="mypage-container">
      <h2>마이페이지</h2>

      {userType === 'owner' ? (
        <div className="owner-view">
          <h3>👑 사장님 전용 기능</h3>
          <ul>
            <li>📌 내 가게 정보 수정</li>
            <li>⭐ 단골 고객 목록 보기</li>
            <li>📝 등록된 리뷰 확인</li>
          </ul>
        </div>
      ) : (
        <div className="user-view">
          <h3>🙋‍♀️ 사용자 마이페이지</h3>
          <ul>
            <li>📝 내가 쓴 리뷰 보기</li>
            <li>❤️ 찜한 가게 목록</li>
            <li>⚙️ 내 정보 수정</li>
          </ul>
        </div>
      )}
    </div>
  );
}
