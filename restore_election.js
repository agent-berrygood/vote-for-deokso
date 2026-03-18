require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function restoreElection() {
    try {
        const docRef = doc(db, 'settings/system');
        await setDoc(docRef, {
            activeElectionId: '0306test',
            electionList: ['0306test', 'default-2026']
        }, { merge: true });

        console.log("Successfully restored election ID '0306test'.");
        process.exit(0);
    } catch (e) {
        console.error("Failed to restore election:", e);
        process.exit(1);
    }
}

restoreElection();
