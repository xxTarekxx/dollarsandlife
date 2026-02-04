// frontend/src/firebase.ts - Modified for on-demand initialization

import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import {
	Firestore,
	connectFirestoreEmulator,
	getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let firebaseInitializationPromise: Promise<{
	app: FirebaseApp;
	auth: Auth;
	db: Firestore;
}> | null = null;

export function initializeFirebaseAndGetServices(): Promise<{
	app: FirebaseApp;
	auth: Auth;
	db: Firestore;
}> {
	if (!firebaseInitializationPromise) {
		firebaseInitializationPromise = (async () => {
			if (!appInstance) {
				appInstance = initializeApp(firebaseConfig);
				authInstance = getAuth(appInstance);
				dbInstance = getFirestore(appInstance);

				// Connect to Firebase Emulators if running locally
				// The connect...Emulator functions are idempotent.
				// They will only connect if not already connected to the specified host/port.
				if (
					typeof window !== "undefined" &&
					(window.location.hostname === "localhost" ||
						window.location.hostname === "127.0.0.1")
				) {
					try {
						if (authInstance) {
							// Ensure authInstance is initialized
							connectAuthEmulator(authInstance, "http://localhost:9099", {
								disableWarnings: true,
							});
						}
					} catch (error) {
						console.error(
							"Firebase: Error during Auth Emulator connection attempt:",
							error,
						);
					}
					try {
						if (dbInstance) {
							// Ensure dbInstance is initialized
							connectFirestoreEmulator(dbInstance, "localhost", 8080);
						}
					} catch (error) {
						console.error(
							"Firebase: Error during Firestore Emulator connection attempt:",
							error,
						);
					}
				}
			}
			if (!appInstance || !authInstance || !dbInstance) {
				// This case should ideally not be reached if initializeApp and getAuth/getFirestore succeed.
				throw new Error(
					"Firebase initialization failed: One or more services are null after initialization attempt.",
				);
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
