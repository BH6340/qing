# 轻·日历 APK 构建脚本
# 用法: powershell -ExecutionPolicy Bypass -File build-apk.ps1
# 产物: apks\app-release.apk

$ErrorActionPreference = "Stop"

# ===== 环境变量 =====
$JAVA_HOME    = "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot"
$ANDROID_HOME = "E:\software\Android\SDK"
$env:JAVA_HOME = $JAVA_HOME
$env:ANDROID_HOME = $ANDROID_HOME
$env:PATH = "$JAVA_HOME\bin;$ANDROID_HOME\platform-tools;$env:PATH"

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ANDROID_DIR  = Join-Path $PROJECT_ROOT "android"
$APK_OUTPUT   = Join-Path $ANDROID_DIR "app\build\outputs\apk\release\app-release.apk"
$APK_DEST     = Join-Path $PROJECT_ROOT "apks\app-release.apk"

# ===== Clean 旧构建 =====
Write-Host ">>> Clean 旧构建缓存" -ForegroundColor Cyan
$buildDir = Join-Path $ANDROID_DIR "app\build"
if (Test-Path $buildDir) {
  Remove-Item $buildDir -Recurse -Force
  Write-Host "  已删除旧 build 目录" -ForegroundColor Green
}

Write-Host ">>> 同步 Web 资源" -ForegroundColor Cyan
Set-Location $PROJECT_ROOT
npx cap copy android
if ($LASTEXITCODE -ne 0) { Write-Host "Capacitor copy 失败" -ForegroundColor Red; exit 1 }

Write-Host ">>> 构建 Release APK" -ForegroundColor Cyan
Set-Location $ANDROID_DIR
$gradleExe = "C:\Users\Administrator\.gradle\wrapper\dists\gradle-8.14.3-all\cbf6zifq8xavouihta8md72jo\gradle-8.14.3\bin\gradle.bat"
& $gradleExe assembleRelease --offline
if ($LASTEXITCODE -ne 0) { Write-Host "Gradle 构建失败" -ForegroundColor Red; exit 1 }

Write-Host ">>> 复制到 apks 目录" -ForegroundColor Cyan
Copy-Item $APK_OUTPUT $APK_DEST -Force

Write-Host ""
Write-Host ">>> 构建成功!" -ForegroundColor Green
Write-Host "APK: $APK_OUTPUT" -ForegroundColor Yellow
$size = [math]::Round((Get-Item $APK_OUTPUT).Length / 1MB, 1)
Write-Host "大小: ${size} MB" -ForegroundColor Yellow
Write-Host "已复制: $APK_DEST" -ForegroundColor Yellow
Write-Host ""
Write-Host "安装到设备: adb install -r `"$APK_OUTPUT`"" -ForegroundColor Gray
