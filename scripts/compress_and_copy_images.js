const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 타겟 디렉토리
const TargetDir = path.join(__dirname, '..', 'public', 'images', 'candidates');

// 소스 폴더들
const SourceFolders = [
    'h:\\내 드라이브\\선거 테스트\\당회보고용\\권사후보',
    'h:\\내 드라이브\\선거 테스트\\당회보고용\\안수집사후보',
    'h:\\내 드라이브\\선거 테스트\\당회보고용\\장로후보'
];

async function processImages() {
    console.log('--- Starting Image Compression & Copy ---');

    // 1. 타겟 폴더 비우기 또는 생성
    if (!fs.existsSync(TargetDir)) {
        fs.mkdirSync(TargetDir, { recursive: true });
        console.log(`Created target directory: ${TargetDir}`);
    } else {
        const files = fs.readdirSync(TargetDir);
        for (const file of files) {
            fs.unlinkSync(path.join(TargetDir, file));
        }
        console.log(`Cleaned target directory: ${TargetDir}`);
    }

    let processedCount = 0;
    let errorCount = 0;

    // 2. 소스 폴더 순회 및 압축 작업
    for (const folder of SourceFolders) {
        if (!fs.existsSync(folder)) {
            console.warn(`Source folder not found: ${folder}`);
            continue;
        }

        const files = fs.readdirSync(folder);
        const jpgFiles = files.filter(file => file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg'));

        console.log(`Processing folder: ${folder} - Found ${jpgFiles.length} images.`);

        for (const file of jpgFiles) {
            const sourcePath = path.join(folder, file);
            let destFileName = file;

            // Normalize filename (ensure .jpg locally)
            if (destFileName.toLowerCase().endsWith('.jpeg')) {
                destFileName = destFileName.slice(0, -5) + '.jpg';
            }

            const destPath = path.join(TargetDir, destFileName);

            try {
                // 고화질 압축 조건 (MozJPEG 활용, 해상도 800px 최적화 등)
                await sharp(sourcePath)
                    .resize({ width: 800, withoutEnlargement: true }) // 너비 800px 맞춤 (확대 안함)
                    .jpeg({
                        quality: 85,
                        mozjpeg: true, // 고화질 효율적 압축
                        progressive: true
                    })
                    .toFile(destPath);

                processedCount++;
                if (processedCount % 50 === 0) console.log(`Processed ${processedCount} images...`);
            } catch (err) {
                console.error(`Failed to process ${file}:`, err.message);
                errorCount++;
            }
        }
    }

    console.log(`--- Finished ---`);
    console.log(`Successfully compressed and copied: ${processedCount} files.`);
    if (errorCount > 0) console.warn(`Errors encountered: ${errorCount} files.`);
}

processImages();
