require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSystemSettings() {
    try {
        console.log("Fetching settings/system...");
        const docRef = doc(db, 'settings/system');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document exists. Data:", docSnap.data());
        } else {
            console.log("Document does NOT exist. Creating it now...");
            // Re-create it just in case
            await setDoc(docRef, {
                activeElectionId: 'default-2026',
                electionList: ['default-2026']
            });
            console.log("Successfully created with default-2026.");
        }
        process.exit(0);
    } catch (e) {
        console.error("Failed to fetch settings/system:", e);
        process.exit(1);
    }
}

checkSystemSettings();
