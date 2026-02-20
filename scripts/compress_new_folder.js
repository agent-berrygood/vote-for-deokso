const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 새롭게 지정된 단일 소스 타겟 폴더
const SourceFolder = 'h:\\내 드라이브\\선거 테스트\\당회보고용\\새 폴더';

// 결과가 저장될 Next.js 프로젝트의 public 이미지 폴더
const TargetDir = path.join(__dirname, '..', 'public', 'images', 'candidates');

async function processImages() {
    console.log('--- Starting Image Compression (Target: ~30KB) & Copy ---');

    // 1. 소스 폴더 존재 여부 확인
    if (!fs.existsSync(SourceFolder)) {
        console.error(`Source folder not found: ${SourceFolder}`);
        process.exit(1);
    }

    // 2. 타겟 폴더 비우기 (완전 교체)
    if (!fs.existsSync(TargetDir)) {
        fs.mkdirSync(TargetDir, { recursive: true });
        console.log(`Created target directory: ${TargetDir}`);
    } else {
        const existingFiles = fs.readdirSync(TargetDir);
        for (const file of existingFiles) {
            fs.unlinkSync(path.join(TargetDir, file));
        }
        console.log(`Cleaned target directory (All existing files removed): ${TargetDir}`);
    }

    let processedCount = 0;
    let errorCount = 0;

    // 3. 소스 폴더 안의 모든 파일 읽기
    const files = fs.readdirSync(SourceFolder);
    // 폴더 내 이미지 파일만 대상 (png, jpg, jpeg) - 대소문자 무관
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    console.log(`Found ${imageFiles.length} image files in source folder.`);

    for (const file of imageFiles) {
        const sourcePath = path.join(SourceFolder, file);

        // 대상 파일명은 무조건 .jpg로 강제
        const parsedPath = path.parse(file);
        const destFileName = parsedPath.name + '.jpg';
        const destPath = path.join(TargetDir, destFileName);

        try {
            // 한글 경로 등 파일 읽기 오류 방지를 위해 버퍼로 가져오기
            const imageBuffer = fs.readFileSync(sourcePath);

            // [요구사항]
            // - 배경 검정 안 됨 -> flatten: 흰색 배경
            // - 30kb 수준 통일 -> 리사이즈 폭 대폭 줄임(width 400~500 수준) + quality 대폭 하향(60~70) + mozjpeg
            await sharp(imageBuffer)
                .resize({ width: 400, withoutEnlargement: true }) // 30kb 수준을 맞추기 위해 너비 축소
                .flatten({ background: '#ffffff' }) // 투명(PNG) 배경을 흰색으로 병합
                .jpeg({
                    quality: 60,  // 화질을 60으로 낮추어 용량 감소
                    mozjpeg: true,
                    chromaSubsampling: '4:2:0' // 파일 크기를 더 줄이기 위함
                })
                .toFile(destPath);

            processedCount++;
            if (processedCount % 50 === 0) console.log(`Processed ${processedCount} images...`);
        } catch (err) {
            console.error(`Failed to process ${file}:`, err.message);
            errorCount++;
        }
    }

    console.log(`--- Finished ---`);
    console.log(`Successfully compressed and replaced: ${processedCount} files in Public folder.`);
    if (errorCount > 0) console.warn(`Errors encountered: ${errorCount} files.`);
}

processImages();
