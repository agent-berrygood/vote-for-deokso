$TargetDir = "c:\Users\E\Desktop\Antigravity\vote\public\images\candidates"
$SourceFolders = @(
    "h:\내 드라이브\선거 테스트\당회보고용\권사후보",
    "h:\내 드라이브\선거 테스트\당회보고용\안수집사후보",
    "h:\내 드라이브\선거 테스트\당회보고용\장로후보"
)

# 1. 대상 디렉토리가 없으면 생성, 있으면 안의 모든 파일 삭제
if (!(Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
    Write-Host "Created target directory: $TargetDir"
}
else {
    Remove-Item (Join-Path $TargetDir "*") -Recurse -Force
    Write-Host "Cleaned target directory: $TargetDir"
}

# 2. 소스 폴더들에서 모든 jpg 파일을 대상 디렉토리로 복사
$copiedCount = 0
foreach ($folder in $SourceFolders) {
    if (Test-Path $folder) {
        $files = Get-ChildItem -Path $folder -Filter "*.jpg" -File
        foreach ($file in $files) {
            Copy-Item -Path $file.FullName -Destination $TargetDir -Force
            $copiedCount++
        }
        Write-Host "Copied from $folder"
    }
    else {
        Write-Host "Source folder not found: $folder"
    }
}

Write-Host "Successfully copied $copiedCount files to $TargetDir."
