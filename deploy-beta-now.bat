@echo off
echo ========================================
echo   立即部署Beta版本到GitHub Pages
echo ========================================
echo.

echo 正在創建beta目錄...
if exist beta rmdir /S /Q beta
mkdir beta

echo 複製文件...
copy index.html beta\
xcopy css beta\css\ /E /I /Q
xcopy js beta\js\ /E /I /Q
copy rules.html beta\
copy README.md beta\
copy beta-info.html beta\

echo 清理開發文件...
if exist beta\test rmdir /S /Q beta\test
del beta\*.bat 2>nul
del beta\*.ps1 2>nul

echo 初始化Git並推送到gh-pages分支...
cd beta
git init
git config user.name "GitHub Actions"
git config user.email "actions@github.com"
git add .
git commit -m "Deploy beta version from mobile-optimization branch"

echo 添加遠程倉庫...
git remote add origin https://github.com/tonyfong/wizard-scoreboard.git

echo 推送到gh-pages分支...
git branch -M gh-pages
git push -f origin gh-pages

cd ..

echo.
echo ✅ Beta版本部署完成！
echo 🌐 您的Beta站點: https://tonyfong.github.io/wizard-scoreboard/beta/
echo.
echo 如果看到404錯誤，請等待5-10分鐘讓GitHub Pages更新
echo.
pause
