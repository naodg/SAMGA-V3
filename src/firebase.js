// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyCvNmPkmwMeq7LMbiTkUKpXDn6tXO_GcVQ",
    authDomain: "samga-2ba55.firebaseapp.com",
    projectId: "samga-2ba55",
    storageBucket: "samga-2ba55.appspot.com",
    messagingSenderId: "650876987710",
    appId: "1:650876987710:web:xxxxx"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
