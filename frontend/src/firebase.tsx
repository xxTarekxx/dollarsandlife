// frontend/src/firebase.ts - Optimized with correct types and lazy-load

import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

let firebaseInitializationPromise: Promise<{
	app: FirebaseApp;
	auth: Auth;
	db: Firestore;
}> | null = null;

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function initializeFirebaseAndGetServices(): Promise<{
	app: FirebaseApp;
	auth: Auth;
	db: Firestore;
}> {
	if (!firebaseInitializationPromise) {
		firebaseInitializationPromise = (async () => {
			if (!appInstance) {
				appInstance = getApps().length
					? getApp()
					: initializeApp(firebaseConfig);

				const { getAuth, connectAuthEmulator } = await import("firebase/auth");
				const { getFirestore, connectFirestoreEmulator } = await import(
					"firebase/firestore"
				);

				authInstance = getAuth(appInstance);
				dbInstance = getFirestore(appInstance);

				if (
					typeof window !== "undefined" &&
					(window.location.hostname === "localhost" ||
						window.location.hostname === "127.0.0.1")
				) {
					try {
						connectAuthEmulator(authInstance, "http://localhost:9099", {
							disableWarnings: true,
						});
						connectFirestoreEmulator(dbInstance, "localhost", 8080);
					} catch (error) {
						console.error("Error connecting to emulators:", error);
					}
				} else {
					console.log(
						"Firebase: Production environment. Connecting to live services.",
					);
				}
			}

			if (!authInstance || !dbInstance) {
				throw new Error("Failed to initialize Firebase services.");
			}

			return { app: appInstance, auth: authInstance, db: dbInstance };
		})();
	}

	return firebaseInitializationPromise;
}

export async function getFirebaseAuth(): Promise<Auth> {
	const { auth } = await initializeFirebaseAndGetServices();
	return auth;
}

export async function getFirebaseDb(): Promise<Firestore> {
	const { db } = await initializeFirebaseAndGetServices();
	return db;
}
