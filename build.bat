@echo off
chcp 65001 >nul
echo ========================================
echo   轻 · 日历 — 打包构建 v1.0.0
echo ========================================
echo.

set VERSION=1.0.0
set OUTPUT=dist
set ZIP=qing-calendar-v%VERSION%.zip

if exist %OUTPUT% rmdir /s /q %OUTPUT%
mkdir %OUTPUT%

echo [1/4] 复制前端文件...
xcopy app %OUTPUT%\app\ /E /I /Q >nul

echo [2/4] 复制后端文件...
xcopy server %OUTPUT%\server\ /E /I /Q >nul
del %OUTPUT%\server\__pycache__\ 2>nul
rmdir /s /q %OUTPUT%\server\__pycache__ 2>nul

echo [3/4] 复制文档...
copy README.md %OUTPUT%\ >nul
copy DEPLOY.md %OUTPUT%\ >nul

echo [4/4] 压缩打包...
if exist %ZIP% del %ZIP%
powershell -Command "Compress-Archive -Path '%OUTPUT%\*' -DestinationPath '%ZIP%' -Force"

echo.
echo ========================================
echo   构建完成!
echo   输出目录: %OUTPUT%\
echo   压缩包: %ZIP%
echo ========================================
pause
