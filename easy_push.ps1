# Easy Git Push Script
# Just run this script to push your latest code to GitHub!
# Usage: Right-click > "Run with PowerShell", OR type: .\easy_push.ps1 in terminal

Write-Host "===============================" -ForegroundColor Yellow
Write-Host "   Stroovo - Easy Git Push" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

$message = Read-Host "`nEnter commit message (or press Enter for auto-message)"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Auto-backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "`nStaging all changes..." -ForegroundColor Cyan
git add .

Write-Host "Committing with message: '$message'" -ForegroundColor Cyan
git commit -m "$message"

Write-Host "Pushing to GitHub (main branch)..." -ForegroundColor Cyan
git push origin main

Write-Host "`n✅ Push Complete! Your code is now on GitHub." -ForegroundColor Green
Write-Host "==============================================`n" -ForegroundColor Green
