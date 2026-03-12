# Blue42 Logo Resizer
# Resizes blue42logo.png to 1000x1000 with high quality

$sourcePath = "C:\Users\rnari\Dev\Blue42\client\public\blue42logo.png"
$outputPath = "C:\Users\rnari\Dev\Blue42\client\public\blue42logo-1000x200.png"

# Check if source exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "Error: Source image not found at $sourcePath" -ForegroundColor Red
    exit 1
}

# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

try {
    # Load the original image
    $image = [System.Drawing.Image]::FromFile($sourcePath)
    
    Write-Host "Original size: $($image.Width) x $($image.Height)" -ForegroundColor Cyan
    
    # Create new 1000x200 bitmap (maintains aspect ratio)
    $newWidth = 1000
    $newHeight = 200
    $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
    
    # Create graphics object with high quality settings
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw the resized image
    $graphics.DrawImage($image, 0, 0, $newWidth, $newHeight)
    
    # Save the resized image
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "Successfully created 1000x200 image at:" -ForegroundColor Green
    Write-Host $outputPath -ForegroundColor Yellow
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $image.Dispose()
    
    Write-Host "`nWould you like to replace the original? (Current file will be backed up)" -ForegroundColor Cyan
    Write-Host "Run this command to replace:" -ForegroundColor White
    Write-Host "Move-Item '$sourcePath' '$($sourcePath).backup' -Force; Move-Item '$outputPath' '$sourcePath' -Force" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error resizing image: $_" -ForegroundColor Red
    exit 1
}
