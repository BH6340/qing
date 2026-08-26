# QING Calendar Publish Script
# Usage: powershell -ExecutionPolicy Bypass -File publish.ps1 -Version "1.0.2" -Changelog "Fix A`nAdd B"

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
Write-Host "  QING Calendar Publish v$Version" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""

# ===== 1. Update version =====
Write-Host "[1/7] Update version..." -ForegroundColor Cyan

$today = Get-Date -Format "yyyy-MM-dd"
$changeLines = $Changelog -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
$changeStr = ($changeLines | ForEach-Object { "        `"$_`"" }) -join ",`r`n"

# Update frontend APP_VERSION & channel meta
$htmlFiles = @("settings.html", "index.html", "todo.html", "detail.html")
foreach ($htmlFile in $htmlFiles) {
    $htmlPath = "$projectDir\app\$htmlFile"
    $htmlContent = Get-Content $htmlPath -Raw -Encoding UTF8
    if ($htmlFile -eq "settings.html") {
        $htmlContent = $htmlContent -replace "const APP_VERSION = '[^']+';", "const APP_VERSION = '$Version';"
    }
    $htmlContent = $htmlContent -replace 'name="app-channel" content="[^"]*"', 'name="app-channel" content="formal"'
    Set-Content $htmlPath $htmlContent -NoNewline -Encoding UTF8
}

# Update backend LATEST_VERSION block
$appPath = "$projectDir\server\app.py"
$appContent = Get-Content $appPath -Raw -Encoding UTF8

# Update APP_VERSION
$appContent = $appContent -replace 'APP_VERSION = "[^"]+"', "APP_VERSION = `"$Version`""

# Update LATEST_VERSION block (between markers)
$formalBlock = @"
# === LATEST_VERSION_START ===
LATEST_VERSION = {
    "version": "$Version",
    "release_date": "$today",
    "changelog": [
$changeStr
    ],
    "apk_url": "/api/download/apk",
    "is_force_update": False,
    "min_version": "1.0.0"
}
# === LATEST_VERSION_END ===
"@

$appContent = $appContent -replace '(?s)# === LATEST_VERSION_START ===.*?# === LATEST_VERSION_END ===', $formalBlock
Set-Content $appPath $appContent -NoNewline -Encoding UTF8

Write-Host "  APP_VERSION -> $Version" -ForegroundColor Green
Write-Host "  release_date -> $today" -ForegroundColor Green
Write-Host "  changelog -> $($changeLines.Count) items" -ForegroundColor Green
Write-Host ""

# ===== 2. Sync Capacitor =====
Write-Host "[2/7] Sync Capacitor..." -ForegroundColor Cyan
Push-Location $projectDir
npx cap copy android 2>&1 | Out-Null
Write-Host "  Done" -ForegroundColor Green
Write-Host ""

# ===== 3. Build APK =====
Write-Host "[3/7] Build APK..." -ForegroundColor Cyan
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

# ===== 4. Copy APK =====
Write-Host "[4/7] Copy APK..." -ForegroundColor Cyan
Copy-Item $apkPath "$projectDir\apks\app-release.apk" -Force
Write-Host "  Done" -ForegroundColor Green
Write-Host ""

# ===== 5. Git push =====
Write-Host "[5/7] Git push..." -ForegroundColor Cyan
Push-Location $projectDir
$ErrorActionPreference = "Continue"
git add .gitignore app/ server/ apks/ capacitor.config.json docker-compose.yml android/app/src/ android/app/build.gradle android/app/capacitor.build.gradle android/app/proguard-rules.pro android/capacitor.settings.gradle android/gradle.properties android/gradlew android/gradlew.bat android/settings.gradle android/variables.gradle 2>&1 | Out-Null
git commit -m "v${Version}: $($changeLines[0])" 2>&1 | Out-Null
git push 2>&1 | Out-Null
$ErrorActionPreference = "Stop"
Pop-Location
Write-Host "  Done" -ForegroundColor Green
Write-Host ""

# ===== 6. Server deploy =====
Write-Host "[6/7] Server deploy..." -ForegroundColor Cyan
$ErrorActionPreference = "Continue"
ssh $server "cd $remoteDir && git pull && docker compose restart" 2>&1
$ErrorActionPreference = "Stop"
Write-Host ""

# ===== 7. Health check =====
Write-Host "[7/7] Health check..." -ForegroundColor Cyan
$maxRetries = 6
$retry = 0
$healthy = $false
while ($retry -lt $maxRetries -and -not $healthy) {
    Start-Sleep -Seconds 3
    try {
        $resp = Invoke-RestMethod -Uri "https://qing6340.duckdns.org/api/health" -TimeoutSec 5
        if ($resp.version -eq $Version) {
            $healthy = $true
            Write-Host "  OK - v$($resp.version)" -ForegroundColor Green
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
Write-Host "  PUBLISHED!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "  Version: v$Version" -ForegroundColor Yellow
Write-Host "  APK:     $apkSize MB" -ForegroundColor Yellow
Write-Host "  Date:    $today" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Android: Settings -> Check Update -> Download" -ForegroundColor White
Write-Host "  iOS/PWA: Settings -> Check Update -> Refresh" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""
