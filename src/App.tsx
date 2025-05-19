import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <Router basename="/SAMGA-V2">
      {/* ✅ Header는 Routes 바깥에 넣기 (공통 레이아웃 영역) */}
      <Header />

      <ScrollToTop />
      
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route path='/privacy' element={<PrivacyPolicy/>}/>

        <Route path="/" element={<Mainthing />} />
        <Route path="/store/:name" element={<StoreDetail />} />
        <Route path="/storefilterpage" element={<StoreFilterPage />} />
        <Route path="/review" element={<ReviewListPage />} />
        <Route path="/write" element={<ReviewWritePage />} />
        <Route path="/review/:id" element={<ReviewDetailPage />} />


        <Route path="/admin/:storeId" element={<AdminDashboard />} />
      </Routes>

      {/* ❓ Footer도 모든 페이지에 나오게 하려면 여기에 둬도 됨 */}
      <Footer />
    </Router>
  )
}

export default App
