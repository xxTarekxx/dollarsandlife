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
    apiKey: "AIzaSyDDc0ctdb9HAtfKBFMcLb_-oZzhA61ZSKc",
    authDomain: "dollarsandlifeforum.firebaseapp.com",
    projectId: "dollarsandlifeforum",
    storageBucket: "dollarsandlifeforum.firebasestorage.app",
    messagingSenderId: "965261990077",
    appId: "1:965261990077:web:b219509b5d2ab678583fd4",
    measurementId: "G-76XESXFFJP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, analytics, db };