import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import StoreDetail from './components/store/store_detail'
import Mainthing from './components/mainthing'
import StoreFilterPage from './components/storefilterpage'
import ReviewWritePage from './components/review/ReviewWritePage'
import ReviewListPage from './components/review/ReviewListPage'
import SignUp from "./components/auth/SignUp"
import SignIn from './components/auth/SignIn'
import AdminDashboard from './components/owner/AdminDashboard'
import ReviewDetailPage from './components/review/ReviewDetailPage'
import ScrollToTop from './components/ScrollTop'
import PrivacyPolicy from './components/auth/Privacy'
import Floating from './components/Floating'
import Mypage from './components/auth/Mypage'
import MyStore from './components/user/mystore'
import MyReview from './components/user/myreview'
import Myinfo from './components/user/Myinfo'
import AdminImageUploader from './components/owner/AdminImageUploader'
import AutoLogoutTimer from './components/auth/AutoLogoutTimer'

function AppContent() {
  const location = useLocation()
  const hideFloatingRoutes = ["/login", "/signup", "/review"]
  const shouldHideFloating = hideFloatingRoutes.some(path => location.pathname.startsWith(path))


  return (
    <>
      <Header />
      <ScrollToTop />

      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route path='/privacy' element={<PrivacyPolicy />} />
        <Route path="/mypage" element={<><AutoLogoutTimer /><Mypage /></>} />
        <Route path='/mypage/mystore' element={<MyStore/>} />
        <Route path='/myreview' element={<MyReview/>} />
        <Route path='/myinfo' element={<Myinfo/>} />

        <Route path="/" element={<Mainthing />} />
        <Route path="/store/:name" element={<StoreDetail />} />
        <Route path="/storefilterpage" element={<StoreFilterPage />} />
        <Route path="/review" element={<ReviewListPage />} />
        <Route path="/write" element={<ReviewWritePage />} />
        <Route path="/review/:id" element={<ReviewDetailPage />} />
        <Route path="/admin/:storeId" element={<AdminDashboard />} />
        <Route path="/uploader/:storeId" element={<AdminImageUploader />} />
      </Routes>

      {!shouldHideFloating && <Floating />}
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router basename="/SAMGA-V3">
      <AppContent />
    </Router>
  )
}

export default App
