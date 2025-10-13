@echo off
echo Starting German Bridge Scoreboard Server...
echo.
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Check if port 8000 is already in use
netstat -an | find "8000" >nul
if %errorlevel% == 0 (
    echo Port 8000 is already in use. Stopping existing server...
    taskkill /f /im python.exe >nul 2>&1
    timeout /t 2 >nul
)

REM Start the server
python -m http.server 8000

pause
