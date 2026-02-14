import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

console.log("Initializing Firebase with config:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// NOTE: Hardcoded based on user context, verify if this ID is active in 'settings/system' if needed.
// But user seems to be using default-2026.
const ELECTION_ID = 'default-2026';

const BASE_DIR = "j:\\내 드라이브\\선거 테스트\\당회보고용";

const FOLDER_MAPPING = {
    "권사후보": "kwonsa",
    "안수집사후보": "ansu",
    "장로후보": "elder"
};

async function uploadImages() {
    console.log(`[Start] Fetching candidates for Election: ${ELECTION_ID}`);
    const candidatesRef = collection(db, `elections/${ELECTION_ID}/candidates`);

    let snapshot;
    try {
        snapshot = await getDocs(candidatesRef);
    } catch (e) {
        console.error("Error fetching candidates:", e);
        return;
    }

    const candidates = [];
    snapshot.forEach(doc => {
        candidates.push({ id: doc.id, ...doc.data() });
    });

    console.log(`[Info] Found ${candidates.length} candidates in DB.`);

    let successCount = 0;
    let failCount = 0;

    for (const [folderName, type] of Object.entries(FOLDER_MAPPING)) {
        const dirPath = path.join(BASE_DIR, folderName);
        if (!fs.existsSync(dirPath)) {
            console.warn(`[Warn] Directory not found: ${dirPath}`);
            continue;
        }

        const files = fs.readdirSync(dirPath);
        console.log(`[Info] Processing ${folderName} (${files.length} files)...`);

        for (const file of files) {
            // Skip non-image files
            if (!file.match(/\.(jpg|jpeg|png|gif)$/i)) continue;

            const rawName = path.parse(file).name;
            // Normalize name: remove whitespace, normalize unicode
            const name = rawName.normalize('NFC').trim();

            // Find candidate by exact name match
            // Note: DB names might also need normalization if they were imported loosely
            const candidate = candidates.find(c => c.name.normalize('NFC').trim() === name);

            if (!candidate) {
                // console.warn(`[Skip] No matched candidate for file: ${file} (Parsed: ${name})`);
                continue;
            }

            console.log(`[Match] ${name} -> ${candidate.id}`);

            try {
                const filePath = path.join(dirPath, file);
                const fileBuffer = fs.readFileSync(filePath);

                // Upload to Storage
                // Path: elections/{electionId}/candidates/{candidateId}/profile.jpg
                // We use .jpg as standard or preserve original extension? 
                // Let's preserve original extension to be safe, or convert. 
                // But browser uses basic upload. Let's just use the file extension from the file.
                const ext = path.parse(file).ext;
                const storagePath = `elections/${ELECTION_ID}/candidates/${candidate.id}/profile${ext}`;
                const storageRef = ref(storage, storagePath);

                // Set content type
                let contentType = 'image/jpeg';
                if (ext.toLowerCase() === '.png') contentType = 'image/png';
                if (ext.toLowerCase() === '.gif') contentType = 'image/gif';

                await uploadBytes(storageRef, fileBuffer, { contentType });
                const downloadURL = await getDownloadURL(storageRef);

                // Update Firestore
                await updateDoc(doc(db, `elections/${ELECTION_ID}/candidates`, candidate.id), {
                    profileUrl: downloadURL
                });

                console.log(`[Success] Uploaded for ${name}: ${downloadURL}`);
                successCount++;
            } catch (error) {
                console.error(`[Error] Failed ${name}:`, error.message);
                failCount++;
            }
        }
    }
    console.log(`[Done] Success: ${successCount}, Failed: ${failCount}`);
}

uploadImages();
