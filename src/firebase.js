// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
    apiKey: "AIzaSyD14pfYMFzHtSZpo4K6j-uzv9H9SbqMbLg",
    authDomain: "samgabeef.firebaseapp.com",
    projectId: "samgabeef",
    storageBucket: "samgabeef.firebasestorage.app",
    messagingSenderId: "211043237282",
    appId: "1:211043237282:web:50294933424dcba04e86fb",
    measurementId: "G-JNZJXH57QZ"
};
// ✅ 중복 초기화 방지
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
