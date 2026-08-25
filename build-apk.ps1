# 轻·日历 APK 构建脚本
# 用法: powershell -ExecutionPolicy Bypass -File build-apk.ps1
# 产物: android\app\build\outputs\apk\debug\app-debug.apk

$ErrorActionPreference = "Stop"

# ===== 环境变量 =====
$JAVA_HOME    = "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot"
$ANDROID_HOME = "E:\software\Android\SDK"
$env:JAVA_HOME = $JAVA_HOME
$env:ANDROID_HOME = $ANDROID_HOME
$env:PATH = "$JAVA_HOME\bin;$ANDROID_HOME\platform-tools;$env:PATH"

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$APP_DIR      = Join-Path $PROJECT_ROOT "app"
$ANDROID_DIR  = Join-Path $PROJECT_ROOT "android"
$APK_OUTPUT  = Join-Path $ANDROID_DIR "app\build\outputs\apk\debug\app-debug.apk"

Write-Host ">>> 同步 Web 资源" -ForegroundColor Cyan
Set-Location $PROJECT_ROOT
npx cap copy android
if ($LASTEXITCODE -ne 0) { Write-Host "Capacitor copy 失败" -ForegroundColor Red; exit 1 }

Write-Host ">>> 构建 APK (debug)" -ForegroundColor Cyan
Set-Location $ANDROID_DIR
.\gradlew.bat assembleDebug --offline
if ($LASTEXITCODE -ne 0) { Write-Host "Gradle 构建失败" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host ">>> 构建成功!" -ForegroundColor Green
Write-Host "APK: $APK_OUTPUT" -ForegroundColor Yellow
$size = [math]::Round((Get-Item $APK_OUTPUT).Length / 1MB, 1)
Write-Host "大小: ${size} MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "安装到设备: adb install -r `"$APK_OUTPUT`"" -ForegroundColor Gray
