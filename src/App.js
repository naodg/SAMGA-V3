import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import StoreDetail from './components/store/store_detail';
import Mainthing from './components/mainthing';
import StoreFilterPage from './components/storefilterpage';
import ReviewWritePage from './components/review/ReviewWritePage';
import ReviewListPage from './components/review/ReviewListPage';
import SignUp from "./components/auth/SignUp";
import SignIn from './components/auth/SignIn';
import AdminDashboard from './components/owner/AdminDashboard';
import ReviewDetailPage from './components/review/ReviewDetailPage';
import ScrollToTop from './components/ScrollTop';
import PrivacyPolicy from './components/auth/Privacy';
import Floating from './components/Floating';
import Mypage from './components/auth/Mypage';
import MyStore from './components/user/mystore';
import MyReview from './components/user/myreview';
import Myinfo from './components/user/Myinfo';
import AdminImageUploader from './components/owner/AdminImageUploader';
import AutoLogoutTimer from './components/auth/AutoLogoutTimer';
import VilageInfo from './components/information/VilageInfo';
import Sotal from './components/information/Sotal';
import Goodsmall from './components/information/Goodsmall';
import GoodsmallDetail from './components/information/GoodsmallDetail';
function AppContent() {
    const location = useLocation();
    const hideFloatingRoutes = ["/login", "/signup", "/review"];
    const shouldHideFloating = hideFloatingRoutes.some(path => location.pathname.startsWith(path));
    const isStoreFilterPage = location.pathname === "/storefilterpage";
    return (_jsxs(_Fragment, { children: [_jsx(Header, { isFixed: isStoreFilterPage }), _jsx(ScrollToTop, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/signup", element: _jsx(SignUp, {}) }), _jsx(Route, { path: "/login", element: _jsx(SignIn, {}) }), _jsx(Route, { path: '/privacy', element: _jsx(PrivacyPolicy, {}) }), _jsx(Route, { path: "/mypage", element: _jsxs(_Fragment, { children: [_jsx(AutoLogoutTimer, {}), _jsx(Mypage, {})] }) }), _jsx(Route, { path: '/mypage/mystore', element: _jsx(MyStore, {}) }), _jsx(Route, { path: '/myreview', element: _jsx(MyReview, {}) }), _jsx(Route, { path: '/myinfo', element: _jsx(Myinfo, {}) }), _jsx(Route, { path: '/vilage', element: _jsx(VilageInfo, {}) }), _jsx(Route, { path: '/mascot', element: _jsx(Sotal, {}) }), _jsx(Route, { path: "/goods", element: _jsx(Goodsmall, {}) }), _jsx(Route, { path: "/goods/:id", element: _jsx(GoodsmallDetail, {}) }), _jsx(Route, { path: "/", element: _jsx(Mainthing, {}) }), _jsx(Route, { path: "/store/:name", element: _jsx(StoreDetail, {}) }), _jsx(Route, { path: "/storefilterpage", element: _jsx(StoreFilterPage, {}) }), _jsx(Route, { path: "/review", element: _jsx(ReviewListPage, {}) }), _jsx(Route, { path: "/write", element: _jsx(ReviewWritePage, {}) }), _jsx(Route, { path: "/review/:id", element: _jsx(ReviewDetailPage, {}) }), _jsx(Route, { path: "/admin/:storeId", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "/uploader/:storeId", element: _jsx(AdminImageUploader, {}) })] }), !shouldHideFloating && _jsx(Floating, {}), _jsx(Footer, {})] }));
}
function App() {
    return (_jsx(Router, { children: _jsx(AppContent, {}) }));
}
export default App;
