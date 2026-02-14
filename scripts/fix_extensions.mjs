import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ELECTION_ID = '당회보고용';

async function fixExtensions() {
    console.log(`[Start] Fixing image extensions for Election: ${ELECTION_ID}`);
    const candidatesRef = collection(db, `elections/${ELECTION_ID}/candidates`);
    const snapshot = await getDocs(candidatesRef);

    let count = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.profileUrl && !data.profileUrl.endsWith('.jpg')) {
            // Replace extension with .jpg
            const newUrl = data.profileUrl.replace(/\.(png|jpeg|gif)$/i, '.jpg');

            await updateDoc(doc(db, `elections/${ELECTION_ID}/candidates`, docSnap.id), {
                profileUrl: newUrl
            });
            // console.log(`[Fixed] ${data.name}: ${data.profileUrl} -> ${newUrl}`);
            count++;
        }
    }
    console.log(`[Done] Fixed ${count} candidate image paths.`);
}

fixExtensions();
