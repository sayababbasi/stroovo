# Sync Backup Script (Incremental)
# This script creates a mirror copy of the project, excluding large/unnecessary folders.

$source = Get-Location
$destination = Join-Path (Split-Path $source -Parent) "backups\work-platform-mirror"

# Create destination if it doesn't exist
if (!(Test-Path $destination)) {
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    Write-Host "Created backup directory at: $destination" -ForegroundColor Cyan
}

Write-Host "Starting incremental backup from $source to $destination..." -ForegroundColor Cyan

# Robocopy options:
# /MIR - Mirror a directory tree
# /XD - Exclude Directories
# /XF - Exclude Files
# /R:0 - 0 retries on failed copies
# /W:0 - 0 seconds wait between retries
# /NP - No Progress (cleans up logs)
# /NFL - No File List (speed up)
# /NDL - No Directory List (speed up)

$excludeDirs = @(".git", "node_modules", ".next", "dist", "temp", ".cursor", ".vscode")
$excludeFiles = @("backup_*.zip", "*.log", "sync_backup.ps1", "easy_push.ps1")

robocopy "$source" "$destination" /MIR /XD $excludeDirs /XF $excludeFiles /R:0 /W:0 /NP /XJD /XJF

Write-Host "`nBackup Complete!" -ForegroundColor Green
Write-Host "Location: $destination" -ForegroundColor White
