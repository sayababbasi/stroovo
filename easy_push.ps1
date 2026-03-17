# Easy Git Push Script
# Automates the Git add, commit, and push process.

$message = Read-Host "Enter commit message (or press Enter for 'Auto-backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm')')"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Auto-backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "Staging changes..." -ForegroundColor Cyan
git add .

Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "$message"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "`nSync Complete!" -ForegroundColor Green
