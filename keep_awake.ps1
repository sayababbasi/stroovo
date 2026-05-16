# Keep Render Backend Awake
# Render's free tier sleeps after 15 minutes of inactivity.
# This script pings your backend every 10 minutes to keep it alive.
# Leave this script running in the background.

$url = "https://stroovo.onrender.com/"
$intervalSeconds = 600 # 10 minutes

Write-Host "===============================" -ForegroundColor Yellow
Write-Host "   Stroovo - Keep Awake Agent" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host "Pinging: $url" -ForegroundColor Cyan
Write-Host "Interval: Every 10 minutes" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor White

while ($true) {
    try {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] Pinging server... " -NoNewline -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 30
        
        if ($response.status -eq "online") {
            Write-Host "SUCCESS (Server is awake!)" -ForegroundColor Green
        } else {
            Write-Host "OK (Status: $($response.status))" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "FAILED ($($_.Exception.Message))" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds $intervalSeconds
}
