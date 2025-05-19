import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
function App() {
    return (_jsxs(Router, { basename: "/SAMGA-V2", children: [_jsx(Header, {}), _jsx(ScrollToTop, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/signup", element: _jsx(SignUp, {}) }), _jsx(Route, { path: "/login", element: _jsx(SignIn, {}) }), _jsx(Route, { path: '/privacy', element: _jsx(PrivacyPolicy, {}) }), _jsx(Route, { path: "/", element: _jsx(Mainthing, {}) }), _jsx(Route, { path: "/store/:name", element: _jsx(StoreDetail, {}) }), _jsx(Route, { path: "/storefilterpage", element: _jsx(StoreFilterPage, {}) }), _jsx(Route, { path: "/review", element: _jsx(ReviewListPage, {}) }), _jsx(Route, { path: "/write", element: _jsx(ReviewWritePage, {}) }), _jsx(Route, { path: "/review/:id", element: _jsx(ReviewDetailPage, {}) }), _jsx(Route, { path: "/admin/:storeId", element: _jsx(AdminDashboard, {}) })] }), _jsx(Footer, {})] }));
}
export default App;
