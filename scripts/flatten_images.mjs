import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '../public/images/candidates');
const SUBFOLDERS = ['kwonsa', 'ansu', 'elder'];

function flattenImages() {
    console.log(`[Start] Flattening images in ${BASE_DIR}...`);

    let movedCount = 0;
    let duplicateCount = 0;

    SUBFOLDERS.forEach(folder => {
        const folderPath = path.join(BASE_DIR, folder);
        if (!fs.existsSync(folderPath)) return;

        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
            if (!file.match(/\.(jpg|jpeg|png|gif)$/i)) return;

            const oldPath = path.join(folderPath, file);
            const newPath = path.join(BASE_DIR, file);

            if (fs.existsSync(newPath)) {
                console.warn(`[Duplicate] ${file} already exists in root. Skipping ${folder}/${file} (Check if different person!)`);
                // Append suffix if needed? 
                // For now, assuming names are unique or it's the same person.
                // If content is different, we might overwrite or rename. 
                // But user policy is "Name Match".
                duplicateCount++;
            } else {
                fs.renameSync(oldPath, newPath);
                movedCount++;
            }
        });

        // Try to remove empty folder
        try {
            if (fs.readdirSync(folderPath).length === 0) {
                fs.rmdirSync(folderPath);
                console.log(`[Removed] Empty folder: ${folder}`);
            }
        } catch (e) {
            console.error(`[Error] Could not remove ${folder}:`, e.message);
        }
    });

    console.log(`[Done] Moved ${movedCount} images. Found ${duplicateCount} duplicates.`);
}

flattenImages();
