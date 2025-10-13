@echo off
:menu
cls
echo ========================================
echo    German Bridge Scoreboard Manager
echo ========================================
echo.
echo 1. Start Server
echo 2. Stop Server
echo 3. Restart Server
echo 4. Check Server Status
echo 5. Open in Browser
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto browser
if "%choice%"=="6" goto exit
goto menu

:start
echo Starting server...
python -m http.server 8000
goto menu

:stop
echo Stopping server...
taskkill /f /im python.exe >nul 2>&1
echo Server stopped.
pause
goto menu

:restart
echo Restarting server...
taskkill /f /im python.exe >nul 2>&1
timeout /t 2 >nul
python -m http.server 8000
goto menu

:status
echo Checking server status...
netstat -an | findstr "8000" >nul
if %errorlevel% == 0 (
    echo Server is RUNNING on port 8000
) else (
    echo Server is NOT RUNNING
)
pause
goto menu

:browser
echo Opening browser...
start http://localhost:8000
goto menu

:exit
echo Goodbye!
exit
