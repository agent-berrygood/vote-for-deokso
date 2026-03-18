require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function scanDB() {
    console.log("=== DB SCAN ===");
    try {
        const electionsSnap = await getDocs(collection(db, 'elections'));
        console.log(`Found ${electionsSnap.size} documents in 'elections' collection:`);
        electionsSnap.forEach(d => console.log(` - ${d.id}`));

        const settingsSnap = await getDocs(collection(db, 'settings'));
        console.log(`\nFound ${settingsSnap.size} documents in 'settings' collection:`);
        settingsSnap.forEach(d => console.log(` - ${d.id}`, d.data()));

        // Also check what collections exist? Web SDK doesn't support listCollections, 
        // but let's check common paths like 'elections/2026-vote/settings'
        const testIds = ['2026', '2026-vote', 'test'];
        for (const id of testIds) {
            const snap = await getDoc(doc(db, `elections/${id}/settings/config`));
            if (snap.exists()) {
                console.log(`Found settings for election ${id}:`, snap.data());
            }
        }

    } catch (e) {
        console.error("Scan error:", e);
    }
    process.exit();
}
scanDB();
