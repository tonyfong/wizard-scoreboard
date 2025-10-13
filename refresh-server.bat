@echo off
echo Refreshing German Bridge Scoreboard Server...
echo.

REM Stop any existing Python server
echo Stopping existing server...
taskkill /f /im python.exe >nul 2>&1
timeout /t 2 >nul

REM Start fresh server
echo Starting fresh server...
python -m http.server 8000
