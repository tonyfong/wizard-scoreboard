# German Bridge Scoreboard Server Starter
Write-Host "Starting German Bridge Scoreboard Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Check if port 8000 is already in use
$portCheck = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "Port 8000 is already in use. Stopping existing server..." -ForegroundColor Red
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Start the server
Write-Host "Starting server..." -ForegroundColor Green
python -m http.server 8000
