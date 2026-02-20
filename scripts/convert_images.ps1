param(
    [string[]]$Folders
)

Add-Type -AssemblyName System.Drawing

foreach ($folder in $Folders) {
    Write-Host "Processing folder: $folder"
    if (Test-Path $folder) {
        $files = Get-ChildItem -Path $folder -File
        foreach ($file in $files) {
            # Skip desktop.ini
            if ($file.Name -eq "desktop.ini") { continue }
            
            # Check if it needs conversion/rename
            if ($file.Extension -cne ".jpg") {
                try {
                    $img = [System.Drawing.Image]::FromFile($file.FullName)
                    $newPath = [System.IO.Path]::ChangeExtension($file.FullName, ".jpg")
                    
                    # If the file just had a different case like .JPG, ChangeExtension might result in exact same path on Windows case-insensitive system
                    if ($file.FullName -eq $newPath) {
                        # Workaround: rename it first
                        $tempPath = $file.FullName + ".tmp"
                        $img.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
                        $img.Dispose()
                        Remove-Item $file.FullName -Force
                        Rename-Item $tempPath -NewName $file.Name.Replace($file.Extension, ".jpg")
                        Write-Host "Renamed/Converted case: $($file.Name) to .jpg"
                    } else {
                        $img.Save($newPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
                        $img.Dispose()
                        Remove-Item $file.FullName -Force
                        Write-Host "Converted: $($file.Name) to .jpg"
                    }
                } catch {
                    Write-Host "Failed to convert: $($file.Name) - $($_.Exception.Message)"
                }
            }
        }
    } else {
        Write-Host "Folder not found: $folder"
    }
}
Write-Host "Conversion completed."
