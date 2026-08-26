# QING Calendar Beta Publish Script
# Usage: powershell -ExecutionPolicy Bypass -File publish-beta.ps1 -Version "1.1.0-beta.1" -Changelog "新增A功能`n优化B体验"

param(
  [Parameter(Mandatory=$true)]
  [string]$Version,

  [Parameter(Mandatory=$true)]
  [string]$Changelog
)

$ErrorActionPreference = "Stop"

$projectDir = "e:\BH\Android\qing"
$server = "bh@103.100.211.146"
$remoteDir = "~/qing"

Write-Host ""
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host "  QING Calendar BETA Publish v$Version" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""

# ===== 1. Update beta version in app.py =====
Write-Host "[1/6] Update beta version info..." -ForegroundColor Cyan

$appPath = "$projectDir\server\app.py"
$content = Get-Content $appPath -Raw -Encoding UTF8
$today = Get-Date -Format "yyyy-MM-dd"

# Build changelog lines
$changeLines = $Changelog -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
$changeStr = ($changeLines | ForEach-Object { "        `"$_`"" }) -join ",`r`n"

$betaBlock = @"
# === LATEST_BETA_VERSION_START ===
LATEST_BETA_VERSION = {
    "version": "$Version",
    "release_date": "$today",
    "changelog": [
$changeStr
    ],
    "apk_url": "/api/download/apk/beta",
    "is_force_update": False,
    "min_version": "1.0.0"
}
# === LATEST_BETA_VERSION_END ===
"@

# Replace the block between markers
$content = $content -replace '(?s)# === LATEST_BETA_VERSION_START ===.*?# === LATEST_BETA_VERSION_END ===', $betaBlock

Set-Content $appPath $content -NoNewline -Encoding UTF8
Write-Host "  beta version -> $Version" -ForegroundColor Green
Write-Host "  release_date -> $today" -ForegroundColor Green
Write-Host "  changelog -> $($changeLines.Count) items" -ForegroundColor Green
Write-Host ""

# ===== 2. Update frontend APP_VERSION (settings.html) =====
Write-Host "[2/6] Update frontend version..." -ForegroundColor Cyan
$settingsPath = "$projectDir\app\settings.html"
$settingsContent = Get-Content $settingsPath -Raw -Encoding UTF8
$settingsContent = $settingsContent -replace "const APP_VERSION = '[^']+';", "const APP_VERSION = '$Version';"
Set-Content $settingsPath $settingsContent -NoNewline -Encoding UTF8
Write-Host "  APP_VERSION -> $Version" -ForegroundColor Green
Write-Host ""

# ===== 3. Sync Capacitor =====
Write-Host "[3/6] Sync Capacitor..." -ForegroundColor Cyan
Push-Location $projectDir
npx cap copy android 2>&1 | Out-Null
Write-Host "  Done" -ForegroundColor Green
Write-Host ""

# ===== 4. Build APK =====
Write-Host "[4/6] Build Beta APK..." -ForegroundColor Cyan
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot"
$env:ANDROID_HOME = "E:\software\Android\SDK"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$gradleExe = "C:\Users\Administrator\.gradle\wrapper\dists\gradle-8.14.3-all\cbf6zifq8xavouihta8md72jo\gradle-8.14.3\bin\gradle.bat"
Push-Location "$projectDir\android"
& $gradleExe assembleRelease --offline 2>&1 | Select-String "BUILD|FAIL|error:"
Pop-Location
$apkPath = "$projectDir\android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apkPath)) {
  Write-Host "  APK build FAILED" -ForegroundColor Red
  exit 1
}
$apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
Write-Host "  APK: $apkSize MB" -ForegroundColor Green
Write-Host ""

# ===== 5. Copy APK & deploy =====
Write-Host "[5/6] Copy APK & deploy to server..." -ForegroundColor Cyan
$betaApkName = "app-beta-$Version.apk"
Copy-Item $apkPath "$projectDir\apks\$betaApkName" -Force
Copy-Item $apkPath "$projectDir\apks\app-beta-latest.apk" -Force
Write-Host "  -> apks\$betaApkName" -ForegroundColor Green

# Git push
Push-Location $projectDir
$ErrorActionPreference = "Continue"
git add .gitignore app/ server/ apks/ capacitor.config.json docker-compose.yml android/app/src/ android/app/build.gradle android/app/capacitor.build.gradle android/app/proguard-rules.pro android/capacitor.settings.gradle android/gradle.properties android/gradlew android/gradlew.bat android/settings.gradle android/variables.gradle 2>&1 | Out-Null
git commit -m "beta v${Version}: $($changeLines[0])" 2>&1 | Out-Null
git push 2>&1 | Out-Null
$ErrorActionPreference = "Stop"
Pop-Location

# Server deploy (pull & restart)
$ErrorActionPreference = "Continue"
ssh $server "cd $remoteDir && git pull && docker compose restart" 2>&1
$ErrorActionPreference = "Stop"
Write-Host ""

# ===== 6. Health check =====
Write-Host "[6/6] Health check..." -ForegroundColor Cyan
$maxRetries = 6
$retry = 0
$healthy = $false
while ($retry -lt $maxRetries -and -not $healthy) {
    Start-Sleep -Seconds 3
    try {
        $resp = Invoke-RestMethod -Uri "https://qing6340.duckdns.org/api/version?channel=beta" -TimeoutSec 5
        if ($resp.latest -eq $Version) {
            $healthy = $true
            Write-Host "  OK - beta version $($resp.latest)" -ForegroundColor Green
        }
    } catch {
        $retry++
    }
    $retry++
}
if (-not $healthy) {
    Write-Host "  WARNING: Health check timed out, but deploy may still be in progress" -ForegroundColor Yellow
}
Write-Host ""

# ===== Done =====
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host "  BETA PUBLISHED!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "  Version: v$Version (beta)" -ForegroundColor Yellow
Write-Host "  APK:     $apkSize MB" -ForegroundColor Yellow
Write-Host "  Date:    $today" -ForegroundColor Yellow
Write-Host ""
Write-Host "  测试步骤：" -ForegroundColor White
Write-Host "  1. 打开 APP -> 设置 -> Beta 测试计划 -> 加入 Beta" -ForegroundColor White
Write-Host "  2. 设置 -> 版本更新 -> 检查更新（会收到 beta 更新）" -ForegroundColor White
Write-Host "  3. 下载安装 beta 版" -ForegroundColor White
Write-Host ""
Write-Host "  接口验证：" -ForegroundColor White
Write-Host "  https://qing6340.duckdns.org/api/version?channel=beta" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""
