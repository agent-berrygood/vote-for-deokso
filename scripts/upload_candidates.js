const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc, query, where } = require("firebase/firestore");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const fs = require("fs");
const path = require("path");

// Firebase Configuration (from .env.local)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const ELECTION_ID = 'default-2026'; // Target Election ID
const BASE_DIR = "j:\\내 드라이브\\선거 테스트\\당회보고용";

// Mapping Folder Name -> Firestore Candidate Type
const FOLDER_MAPPING = {
    "권사후보": "kwonsa",
    "안수집사후보": "ansu",
    "장로후보": "elder"
};

async function uploadImages() {
    console.log(`[Start] Uploading images to Election: ${ELECTION_ID}`);
    const candidatesRef = collection(db, `elections/${ELECTION_ID}/candidates`);
    const snapshot = await getDocs(candidatesRef);
    const candidates = [];

    snapshot.forEach(doc => {
        candidates.push({ id: doc.id, ...doc.data() });
    });

    console.log(`[Info] Found ${candidates.length} candidates in DB.`);

    for (const [folderName, type] of Object.entries(FOLDER_MAPPING)) {
        const dirPath = path.join(BASE_DIR, folderName);
        if (!fs.existsSync(dirPath)) {
            console.warn(`[Warn] Directory not found: ${dirPath}`);
            continue;
        }

        const files = fs.readdirSync(dirPath);
        console.log(`[Info] Processing ${folderName} (${files.length} files)...`);

        for (const file of files) {
            if (file.toLowerCase().endsWith('.zip') || file.toLowerCase().endsWith('.txt') || file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.xls')) continue;

            // Filename format: Name.png or NameA.png
            const rawName = path.parse(file).name;
            const name = rawName.normalize('NFC').trim();

            // Find candidate
            // Try exact match first
            let candidate = candidates.find(c => c.name === name);

            // If not found, try removing trailing alphabets (e.g., 김철수A -> 김철수) IF logic requires, 
            // BUT based on file list '김철수A' usually means the candidate name is '김철수A' in the DB too if imported from Excel.
            // So we stick to exact match first.

            if (!candidate) {
                // Try matching without trailing A/B/C if specific business logic exists, otherwise skip
                console.warn(`[Skip] No matching candidate found for file: ${file} (Name: ${name})`);
                continue;
            }

            console.log(`[Match] Found candidate for ${file}: ${candidate.name} (${candidate.type})`);

            try {
                // 1. Read file
                const filePath = path.join(dirPath, file);
                const fileBuffer = fs.readFileSync(filePath);

                // 2. Upload to Storage
                const storagePath = `elections/${ELECTION_ID}/candidates/${candidate.id}/profile.jpg`; // Standardize extension if needed
                const storageRef = ref(storage, storagePath);

                await uploadBytes(storageRef, fileBuffer, { contentType: 'image/jpeg' }); // Use mime type detection if strictly needed
                const downloadURL = await getDownloadURL(storageRef);

                // 3. Update Firestore
                await updateDoc(doc(db, `elections/${ELECTION_ID}/candidates`, candidate.id), {
                    profileUrl: downloadURL
                });

                console.log(`[Success] Uploaded & Updated: ${candidate.name}`);
            } catch (error) {
                console.error(`[Error] Failed to process ${file}:`, error);
            }
        }
    }
    console.log("[Done] All processes finished.");
}

// Convert .env.local to process.env manually since we are running via node
const dotenv = require('fs').readFileSync('.env.local', 'utf-8');
dotenv.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

uploadImages();
