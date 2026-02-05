// frontend/src/firebase.ts - On-demand initialization; dev uses real Firebase unless emulators opted in

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

const useEmulators =
	typeof window !== "undefined" &&
	(window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1") &&
	process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

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
				if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
					throw new Error(
						"Firebase (dev): Missing env vars. Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to .env.local",
					);
				}
				appInstance = initializeApp(firebaseConfig);
				authInstance = getAuth(appInstance);
				dbInstance = getFirestore(appInstance);

				if (useEmulators) {
					try {
						connectAuthEmulator(authInstance!, "http://localhost:9099", {
							disableWarnings: true,
						});
						connectFirestoreEmulator(dbInstance!, "localhost", 8080);
						if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
							console.info("[Firebase] Using Auth & Firestore emulators (localhost:9099, 8080)");
						}
					} catch (e) {
						console.error("Firebase: Emulator connection failed. Start with: firebase emulators:start --only auth,firestore", e);
					}
				} else if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
					console.info("[Firebase] Using real project:", firebaseConfig.projectId, "— Set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true to use emulators.");
				}
			}
			if (!appInstance || !authInstance || !dbInstance) {
				throw new Error(
					"Firebase initialization failed: One or more services are null.",
				);
			}
			return { app: appInstance, auth: authInstance, db: dbInstance };
		})();
	}
	return firebaseInitializationPromise;
}

/**
 * Call in development to verify Firebase is usable (config + init). Logs result to console.
 * Use e.g. on forum mount or in a useEffect.
 */
export async function verifyFirebaseInDev(): Promise<{
	ok: boolean;
	message: string;
}> {
	if (process.env.NODE_ENV !== "development" || typeof window === "undefined") {
		return { ok: true, message: "Not in browser dev" };
	}
	const hasConfig =
		!!firebaseConfig.projectId &&
		!!firebaseConfig.apiKey &&
		!!firebaseConfig.authDomain;
	if (!hasConfig) {
		const msg =
			"Firebase (dev): Missing .env.local. Add NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.";
		console.warn(msg);
		return { ok: false, message: msg };
	}
	try {
		const { auth, db } = await initializeFirebaseAndGetServices();
		const ok = !!auth && !!db;
		const message = ok
			? `Firebase (dev): OK — project ${firebaseConfig.projectId}${useEmulators ? " (emulators)" : ""}`
			: "Firebase (dev): Auth or Firestore is null after init.";
		console.info(message);
		return { ok, message };
	} catch (e) {
		const message = `Firebase (dev): Init failed — ${e instanceof Error ? e.message : String(e)}`;
		console.error(message);
		return { ok: false, message };
	}
}

export async function getFirebaseAuth(): Promise<Auth> {
	const { auth } = await initializeFirebaseAndGetServices();
	return auth;
}

export async function getFirebaseDb(): Promise<Firestore> {
	const { db } = await initializeFirebaseAndGetServices();
	return db;
}
