import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurations
const SOURCE_DIR = 'j:\\내 드라이브\\선거 테스트'; // Adjust if valid path
const TARGET_DIR = path.resolve(__dirname, '../public/images/candidates');
const IMG_WIDTH = 300;
const QUALITY = 80;

// Since we know the source might be "j:\내 드라이브\선거 테스트\당회보고용" based on previous list_dir
// We'll search recursively in the source and flatten into TARGET_DIR

async function copyAndResize() {
    console.log(`[Start] Copying & Resizing from GDrive...`);

    // We need to find where the images effectively are.
    // Based on list_dir: j:\내 드라이브\선거 테스트 -> 당회보고용 (dir)
    // So likely: j:\내 드라이브\선거 테스트\당회보고용\장로... etc OR just flat files.
    // I will use a recursive walker to find all images in source.

    const sourceRoot = path.join(SOURCE_DIR, '당회보고용');
    if (!fs.existsSync(sourceRoot)) {
        console.error(`Source path headers not found: ${sourceRoot}`);
        return;
    }

    if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });

    const filesToProcess = [];

    function walk(dir) {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                walk(filePath);
            } else {
                if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    filesToProcess.push(filePath);
                }
            }
        });
    }

    walk(sourceRoot);
    console.log(`[Info] Found ${filesToProcess.length} images in source.`);

    let count = 0;
    let errorCount = 0;

    for (const srcPath of filesToProcess) {
        const parsed = path.parse(srcPath);
        const destFileName = parsed.name + '.jpg'; // Force .jpg extension
        const destPath = path.join(TARGET_DIR, destFileName);

        // Resize and Save directly
        try {
            await sharp(srcPath)
                .resize(IMG_WIDTH)
                .toFormat('jpeg', { quality: QUALITY })
                .toFile(destPath);
            count++;
            if (count % 50 === 0) console.log(`Processed ${count}...`);
        } catch (err) {
            console.error(`[Error] ${fileName}:`, err.message);
            errorCount++;
        }
    }

    console.log(`[Done] Processed ${count} images. Errors: ${errorCount}`);
}

copyAndResize();
