/**
 * Firebase Firestore Data Import Script
 * Usage: node scripts/importData.js <serviceAccountKey.json>
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = process.argv[2];
if (!serviceAccountPath) {
    console.error('Usage: node scripts/importData.js <path/to/new-serviceAccountKey.json>');
    process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const backupFile = path.join(__dirname, '../firebase_backup.json');

if (!fs.existsSync(backupFile)) {
    console.error('Backup file not found. Run exportData.js first.');
    process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

async function importData(targetPath, data) {
    for (const docId in data) {
        const item = data[docId];
        const docRef = db.doc(`${targetPath}/${docId}`);
        
        console.log(`Importing document: ${targetPath}/${docId}`);
        await docRef.set(item._data);

        if (item._subCollections) {
            for (const subColName in item._subCollections) {
                await importData(`${targetPath}/${docId}/${subColName}`, item._subCollections[subColName]);
            }
        }
    }
}

async function runImport() {
    console.log('Starting import to new project...');
    for (const colName in backup) {
        await importData(colName, backup[colName]);
    }
    console.log('Import completed successfully!');
}

runImport().catch(console.error);
