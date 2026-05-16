# Sync Backup Script (Incremental Mirror)
# Creates a safe local backup of the project, excluding large/unnecessary folders.
# Usage: Right-click > "Run with PowerShell", OR type: .\sync_backup.ps1 in terminal

Write-Host "===============================" -ForegroundColor Yellow
Write-Host "   Stroovo - Sync Backup" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

$source = Get-Location
$destination = Join-Path (Split-Path $source -Parent) "backups\stroovo-mirror"

# Create destination if it doesn't exist
if (!(Test-Path $destination)) {
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    Write-Host "`nCreated backup directory at: $destination" -ForegroundColor Cyan
}

Write-Host "`nStarting incremental backup..." -ForegroundColor Cyan
Write-Host "From: $source" -ForegroundColor White
Write-Host "To:   $destination" -ForegroundColor White

# Robocopy options:
# /MIR - Mirror (deletes files in dest that don't exist in source)
# /XD  - Exclude Directories
# /XF  - Exclude Files
# /R:0 - 0 retries on failed copies
# /W:0 - 0 seconds wait between retries
# /NP  - No Progress bar (cleaner output)

$excludeDirs  = @(".git", "node_modules", ".next", "dist", "tmp", "temp", "scratch", ".vscode", ".cursor")
$excludeFiles = @("*.log", "*.zip", "sync_backup.ps1", "easy_push.ps1", "project_dump*.txt", "report_context.txt")

robocopy "$source" "$destination" /MIR /XD $excludeDirs /XF $excludeFiles /R:0 /W:0 /NP /XJD /XJF

Write-Host "`n✅ Backup Complete!" -ForegroundColor Green
Write-Host "Location: $destination" -ForegroundColor White
Write-Host "==============================================`n" -ForegroundColor Green
