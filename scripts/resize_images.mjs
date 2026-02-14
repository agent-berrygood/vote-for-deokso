import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = path.resolve(__dirname, '../public/images/candidates');

// Target settings to achieve ~3KB
const IMG_WIDTH = 100;
const PROCESSED_EXT = '.jpg'; // Force JPEG for better compression
const QUALITY = 60;

async function processImages() {
    console.log(`[Start] Resizing images in ${TARGET_DIR} to width ${IMG_WIDTH}px...`);

    const folders = ['kwonsa', 'ansu', 'elder'];
    let count = 0;

    for (const folder of folders) {
        const dirPath = path.join(TARGET_DIR, folder);
        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath);
        console.log(`[Info] Processing ${folder} (${files.length} files)...`);

        for (const file of files) {
            if (!file.match(/\.(jpg|jpeg|png|gif)$/i)) continue;

            const filePath = path.join(dirPath, file);
            const rawName = path.parse(file).name;
            const newFileName = rawName + PROCESSED_EXT;
            const tempPath = path.join(dirPath, `temp_${newFileName}`);

            try {
                // Resize and compress
                await sharp(filePath)
                    .resize(IMG_WIDTH) // Width 100px, auto height
                    .toFormat('jpeg', { quality: QUALITY })
                    .toFile(tempPath);

                // Replace original (or delete original and keep new if extension changed)
                // If extension is different (e.g., png -> jpg), delete old
                if (path.extname(file).toLowerCase() !== PROCESSED_EXT) {
                    fs.unlinkSync(filePath);
                }

                // Rename temp to final
                // Note: if we changed extension, we need to update the filename on disk
                const finalPath = path.join(dirPath, newFileName);

                // If the target file already exists (and it wasn't the original), we overwrite
                fs.renameSync(tempPath, finalPath);

                // Check size
                const stats = fs.statSync(finalPath);
                // console.log(`[Success] ${file} -> ${newFileName} (${(stats.size / 1024).toFixed(2)} KB)`);
                count++;
            } catch (err) {
                console.error(`[Error] Failed to process ${file}:`, err);
            }
        }
    }
    console.log(`[Done] Processed ${count} images.`);
}

processImages();
