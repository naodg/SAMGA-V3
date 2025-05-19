import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { storeData, Store } from '../data/storeData'
import './storelist.css'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const bannerImages = [
  {
    src: '/SAMGA-V2/img/banner/banner5.png',
    caption: '좋은사람과 같이 걷기 좋은 \n 삼가특화거리-소화잘되는 길',
    link: 'https://blog.naver.com/hc-urc/222571944010',
  },
  {
    src: '/SAMGA-V2/img/banner/banner4.png',
    caption: '4계절 각기다른 멋! 황매산 군립공원 \n 공식사이트 바로가기',
    link: 'https://www.hc.go.kr/09418/09425/09833.web'
  },
  {
    src: '/SAMGA-V2/img/banner/banner3.png',
    caption: '생명의 아름다운 멋으로 가득한 정양늪 \n 공식사이트 바로가기',
    link: 'https://www.youtube.com/watch?v=DjprccTSapc'
  },
  {
    src: '/SAMGA-V2/img/banner/banner2.png',
    caption: '삼가의 멋-삼가시장 \n합천 공식유튜브 바로가기',
    link: 'https://www.youtube.com/watch?v=ZLch32VzUb0'
  },
  {
    src: '/SAMGA-V2/img/banner/banner1.png',
    caption: '영화같은일상 합천영상테마파크 \n 공식사이트 바로가기',
    link: 'https://hcmoviethemepark.com/'
  },
]

// 카드 섞이는 코드
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}




export default function StoreList() {
  const isMobile = window.innerWidth <= 900
  const navigate = useNavigate()
  const handleStoreClick = (storeName: string) => {
    navigate(`/store/${encodeURIComponent(storeName)}`)
  }
  const shuffledStores = useMemo(() => shuffleArray(storeData), []);


  return (
    <div className="storelist-landing">

      <div className="landing-video-wrapper">
        <img src="/SAMGA-V2/img/logo/videologo.svg" alt="삼가한우로고" className="landing-logo" />

        <iframe
          src="https://drive.google.com/file/d/1WF-K2Nu6Jer87imLhWAyKXeWraxIkvVP/preview"
          width="85%"
          height="400px"
          frameBorder="0"
          style={{ borderRadius: '12px', padding: '110px 0 0' }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>

      </div>

      <div className="landing-text">
        <img src="/SAMGA-V2/img/logo/tasty.svg" alt="tasty" className="tasty" />
        <h2 className="landing-title">
          삼가에선 한우가 일상,<br />
          매일 특별한 고기 한 끼
        </h2>
        <hr className="landing-divider" />
        <p className="landing-tagline">KOREAN BEEF VILLAGE SAMGA</p>
      </div>





      <div className="store-card-grid">
        {shuffledStores.map((store, index) => {
          const offsetY = [0, 50, 10][index % 3]
          return (
            <div className="store-card-wrapper">
              <h3
                className="store-title"
                style={{
                  transform: isMobile ? '' : `translateY(${offsetY}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px' // 텍스트랑 아이콘 사이 여백
                }}
              >
                <img
                  src="/SAMGA-V2/img/logo/제목옆아이콘.svg"
                  alt="아이콘"
                  style={{
                    width: '18px',
                    height: '18px',
                    objectFit: 'contain'
                  }}
                />
                {store.name}
              </h3>

              <div
                className="store-card"
                style={{
                  transform: isMobile ? '' : `translateY(${offsetY}px)`
                }}
                onClick={() => handleStoreClick(store.name)}
              >
                <img src={store.image} alt={store.name} className="store-card-image" />

                {/* <div
                  className={`store-card-textbox ${store.name === '대가식육식당' ? 'center-text' : ''
                    }`}
                >
                  <h3 className="store-desc">{store.slogan}</h3>
                  {store.slogan2 && (
                    <p className="store-subdesc">
                      {store.slogan2}
                    </p>
                  )}
                  <button className="store-button">자세히 보기</button>
                </div> */}
              </div>
            </div>

          )
        })}


        <div className="store-card-wrapper">
          <h3
            className="store-title"
            style={{
              // transform: isMobile ? '' : `translateY(${offsetY}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px' // 텍스트랑 아이콘 사이 여백
            }}
          >
            <img
              src="/SAMGA-V2/img/logo/제목옆아이콘.svg"
              alt="아이콘"
              style={{
                width: '18px',
                height: '18px',
                objectFit: 'contain'
              }}
            />
            牛리마을
          </h3>
          <div className="store-card">
            <img src={"/SAMGA-V2/samga/store/소탈이.jpg"} alt={"소탈이"} className="store-card-image" />
          </div>
        </div>
      </div>


      <div className="banner-wrapper">
        <div className="banner-title-area">
          <img src="/SAMGA-V2/img/logo/bannerlogo.svg" alt="타이틀로고" className="slogan-img" />
          <div className="banner-subtitle">
            <span className="bolder">맛!</span>있는
            <span className="bolder">멋!</span>있는 좋은
            <span className="bolder">사람</span>과
          </div>
          <div className="banner-title">
            가볼만한 곳?
          </div>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          pagination={{ clickable: false }} // ← 똥글뱅이 없애는 거!
          autoplay={{ delay: 2000 }}
          loop
          spaceBetween={20}
          slidesPerView={4}
          breakpoints={{
            0: {
              slidesPerView: 1, // ✅ 모바일 (0px 이상)에서는 1장씩
            },
            768: {
              slidesPerView: 4, // ✅ 태블릿 이상에서는 2장씩
            },
          }}
          className="banner-swiper"
        >
          {bannerImages.map((item, index) => (
            <SwiperSlide key={index} className="banner-slide">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="banner-link">
                <img src={item.src} alt={`배너${index + 1}`} className="banner-img" />
                <div className="banner-hover-caption">
                  <p>{item.caption}</p>
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>


    </div >
  )
}
