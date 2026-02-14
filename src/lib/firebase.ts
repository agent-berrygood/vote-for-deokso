import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Use initializeFirestore with experimentalForceLongPolling to bypass some firewalls
console.log("[Firebase] Initializing with LongPolling. API Key exists?", !!firebaseConfig.apiKey);
console.log("[Firebase] Project ID:", firebaseConfig.projectId);
console.log("[Firebase] Storage Bucket:", firebaseConfig.storageBucket);
const db = initializeFirestore(app, {});
const storage = getStorage(app);

export { app, db, storage };
