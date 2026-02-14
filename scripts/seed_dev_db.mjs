import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, writeBatch } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local (Dev DB)
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

console.log("Seeding Database:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ELECTION_ID = '당회보고용';

async function seedDatabase() {
    // 1. Create Election Document
    console.log("Creating Election...");
    await setDoc(doc(db, "elections", ELECTION_ID), {
        title: "2026년 직분자 선출 (개발용)",
        status: "active",
        createdAt: new Date(),
        settings: {
            requireAuth: true,
            allowanonymous: false,
            maxVotes: {
                elder: 5,
                ansu: 5,
                kwonsa: 5
            }
        }
    });

    // 2. Create Candidates from Local Images
    console.log("Creating Candidates...");
    const candidatesPath = path.resolve(__dirname, '../public/images/candidates');
    const folders = {
        'elder': '장로후보',
        'ansu': '안수집사후보',
        'kwonsa': '권사후보'
    };

    let batch = writeBatch(db);
    let count = 0;
    const batchSize = 400; // Limit is 500

    for (const [type, _label] of Object.entries(folders)) {
        const dir = path.join(candidatesPath, type);
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

            const name = path.parse(file).name; // Filename is the name
            const id = type + '_' + name; // simple ID

            // Create Candidate Doc
            const candidateRef = doc(db, `elections/${ELECTION_ID}/candidates`, id);
            batch.set(candidateRef, {
                name: name,
                type: type, // elder, ansu, kwonsa
                position: type === 'elder' ? '장로' : (type === 'ansu' ? '안수집사' : '권사'),
                profileUrl: `/images/candidates/${type}/${file}`, // Local path
                votesByRound: { "1": 0 }
            });

            count++;
            if (count % batchSize === 0) {
                await batch.commit();
                batch = writeBatch(db);
                console.log(`Committed ${count} candidates...`);
            }
        }
    }
    await batch.commit();
    console.log(`[Done] Created ${count} candidates.`);
}

seedDatabase();
