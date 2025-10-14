@echo off
echo ========================================
echo   手動部署Beta版本到GitHub Pages
echo ========================================
echo.

echo 1. 創建beta目錄...
mkdir beta 2>nul

echo 2. 複製必要文件...
copy index.html beta\
xcopy css beta\css\ /E /I
xcopy js beta\js\ /E /I
copy rules.html beta\
copy README.md beta\
copy beta-info.html beta\

echo 3. 清理開發文件...
rmdir /S /Q beta\test 2>nul
del beta\*.bat 2>nul
del beta\*.ps1 2>nul

echo 4. 初始化Git倉庫...
cd beta
git init
git add .
git commit -m "Deploy beta version"

echo 5. 推送到gh-pages分支...
git branch -M gh-pages
git remote add origin https://github.com/tonyfong/wizard-scoreboard.git
git push -f origin gh-pages

echo.
echo ✅ Beta版本已部署！
echo 🌐 訪問: https://tonyfong.github.io/wizard-scoreboard/beta/
echo.
pause
