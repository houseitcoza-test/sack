// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZ8LMZ_Mvro1VnRLQqIUt3y1yLGrbjWo8",
  authDomain: "houseitattempt.firebaseapp.com",
  projectId: "houseitattempt",
  storageBucket: "houseitattempt.appspot.com",
  messagingSenderId: "178886195513",
  appId: "1:178886195513:web:1de9ff03f39f366f0d10e8",
  measurementId: "G-1E6C6W7EC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in web environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
