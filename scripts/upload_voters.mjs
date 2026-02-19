
import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ELECTION_ID = 'default-2026';
const CSV_FILE = 'test_data/voters_generated.csv';

async function uploadVoters() {
    console.log(`Uploading voters to election: ${ELECTION_ID}`);
    const filePath = path.resolve(__dirname, '../', CSV_FILE);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    // Skip header
    const headers = lines[0].split(',');
    const dataLines = lines.slice(1);

    let batch = writeBatch(db);
    let count = 0;
    const batchSize = 400;

    for (const line of dataLines) {
        const [name, phone, birthdate] = line.split(',').map(s => s.trim());
        if (!name || !phone || !birthdate) continue;

        // Create document ID (e.g., name_phone or auto-ID)
        // Using auto-ID is fine, or custom ID to prevent duplicates easily
        const docRef = doc(collection(db, `elections/${ELECTION_ID}/voters`));

        batch.set(docRef, {
            name,
            phone, // Storing as '010-0000-0000'
            birthdate, // '921124'
            hasVoted: false,
            createdAt: new Date()
        });

        count++;
        if (count % batchSize === 0) {
            await batch.commit();
            batch = writeBatch(db);
            console.log(`Uploaded ${count} voters...`);
        }
    }

    await batch.commit();
    console.log(`[Done] Uploaded ${count} voters.`);
}

uploadVoters();
