// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth"; // Added connectAuthEmulator
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"; // Added connectFirestoreEmulator
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDDc0ctdb9HAtfKBFMcLb_-oZzhA61ZSKc", // Replace with your actual API key if different
	authDomain: "dollarsandlifeforum.firebaseapp.com",
	projectId: "dollarsandlifeforum",
	storageBucket: "dollarsandlifeforum.firebasestorage.app",
	messagingSenderId: "965261990077",
	appId: "1:965261990077:web:b219509b5d2ab678583fd4",
	measurementId: "G-76XESXFFJP", // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== "undefined") {
	// Ensure getAnalytics is only called in the browser
	analytics = getAnalytics(app);
}

const auth = getAuth(app);
const db = getFirestore(app);

// Connect to Firebase Emulators if the app is running locally
// Ensure your emulators are running (e.g., `firebase emulators:start`)
// Default ports: Auth (9099), Firestore (8080)
// Check your firebase.json or emulator startup logs for the correct ports if you've changed them.
if (
	typeof window !== "undefined" &&
	(window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1")
) {
	try {
		connectAuthEmulator(auth, "http://localhost:9099");
	} catch (error) {
		console.error("Error connecting to Auth Emulator:", error);
	}
	try {
		connectFirestoreEmulator(db, "localhost", 8080);
	} catch (error) {
		console.error("Error connecting to Firestore Emulator:", error);
	}
	// If you use Firebase Functions emulator:
	// import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
	// const functions = getFunctions(app);
	// connectFunctionsEmulator(functions, "localhost", 5001);
} else {
	console.log(
		"Production environment detected: Connecting to live Firebase services.",
	);
}

export { app, auth, analytics, db };
