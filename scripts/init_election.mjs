
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log("Initializing Firebase with project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initElection() {
    console.log("Initializing Election System Settings...");
    try {
        await setDoc(doc(db, "settings", "system"), {
            activeElectionId: "default-2026",
            electionList: ["default-2026"]
        }, { merge: true });
        console.log("Success! Active Election ID set to: default-2026");
    } catch (e) {
        console.error("Error initializing election settings:", e);
    }
}

initElection();
