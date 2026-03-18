/**
 * Firebase Firestore Data Export Script
 * Usage: node scripts/exportData.js
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize with current environment or service account
// If you have a service account key, use:
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// For now, assuming environment variables are set for the source project
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault() // Or use project-specific config
    });
}

const db = admin.firestore();
const collections = ['elections', 'adminLogs']; // Root collections

async function exportCollection(collectionName, parentPath = '') {
    const fullPath = parentPath ? `${parentPath}/${collectionName}` : collectionName;
    console.log(`Exporting: ${fullPath}...`);
    
    const snapshot = await db.collection(fullPath).get();
    const data = {};

    for (const doc of snapshot.docs) {
        const docData = doc.data();
        data[doc.id] = {
            _data: docData,
            _subCollections: {}
        };

        // Check for common subcollections based on project structure
        if (collectionName === 'elections') {
            const subCols = ['candidates', 'voters', 'settings'];
            for (const sub of subCols) {
                const subData = await exportCollection(sub, `${fullPath}/${doc.id}`);
                if (Object.keys(subData).length > 0) {
                    data[doc.id]._subCollections[sub] = subData;
                }
            }
        }
    }
    return data;
}

async function runExport() {
    const backup = {};
    for (const col of collections) {
        backup[col] = await exportCollection(col);
    }

    const outputPath = path.join(__dirname, '../firebase_backup.json');
    fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2));
    console.log(`Export completed! Data saved to ${outputPath}`);
}

runExport().catch(console.error);
