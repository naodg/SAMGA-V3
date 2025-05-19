import { jsx as _jsx } from "react/jsx-runtime";
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
_jsx("link", { href: "https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap", rel: "stylesheet" });
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
