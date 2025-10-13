@echo off
echo ========================================
echo   德國橋牌計分程式 - 自動化測試
echo ========================================
echo.

REM 檢查測試目錄是否存在
if not exist "test" (
    echo 創建測試目錄...
    mkdir test
)

REM 啟動測試服務器
echo 啟動測試服務器...
start /B python -m http.server 8001

REM 等待服務器啟動
timeout /t 3 >nul

REM 打開測試頁面
echo 打開測試頁面...
start http://localhost:8001/test/test-framework.html

echo.
echo 測試頁面已打開，請在瀏覽器中運行測試。
echo 服務器運行在: http://localhost:8001
echo 按任意鍵停止服務器...
pause >nul

REM 停止服務器
echo 停止測試服務器...
taskkill /f /im python.exe >nul 2>&1

echo 測試完成！
pause
