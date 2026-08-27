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
$gradleExe = "C:\Users\Administrator\.gradle\wrapper\dists\gradle-8.14.3-all\cbf6zifq8xavouihta8md72jo\gradle-8.14.3\bin\gradle.bat"

# Environment for Gradle/Android build
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot"
$env:ANDROID_HOME = "E:\software\Android\SDK"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host ""
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host "  QING Calendar Publish v$Version" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""

$today = Get-Date -Format "yyyy-MM-dd"
$changeLines = $Changelog -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
$changeStr = ($changeLines | ForEach-Object { "        `"$_`"" }) -join ",`r`n"

# ===== 1. Update frontend config.js =====
Write-Host "[1/8] Update frontend config.js..." -ForegroundColor Cyan
$configPath = "$projectDir\app\js\config.js"
$configContent = Get-Content $configPath -Raw -Encoding UTF8
$configContent = $configContent -replace "version: '[^']+',", "version: '$Version',"
$configContent = $configContent -replace "channel: '[^']+',", "channel: 'formal',"
Set-Content $configPath $configContent -NoNewline -Encoding UTF8
Write-Host "  version -> $Version" -ForegroundColor Green
Write-Host "  channel -> formal" -ForegroundColor Green

# Update app-channel meta in all HTML files
$htmlFiles = @('index.html', 'settings.html', 'todo.html', 'detail.html')
foreach ($f in $htmlFiles) {
  $htmlPath = "$projectDir\app\$f"
  if (Test-Path $htmlPath) {
    $htmlContent = Get-Content $htmlPath -Raw -Encoding UTF8
    $htmlContent = $htmlContent -replace 'name="app-channel" content="[^"]*"', 'name="app-channel" content="formal"'
    Set-Content $htmlPath $htmlContent -NoNewline -Encoding UTF8
  }
}
Write-Host "  HTML meta channel -> formal" -ForegroundColor Green
Write-Host ""

# ===== 2. Update backend version info =====
Write-Host "[2/8] Update backend version info..." -ForegroundColor Cyan
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

# ===== 3. Clean old build & Sync Capacitor =====
Write-Host "[3/8] Clean old build & sync Capacitor..." -ForegroundColor Cyan
Push-Location $projectDir
# Stop Gradle daemon first to release file locks
& $gradleExe --stop 2>&1 | Out-Null
Start-Sleep -Seconds 2
# Clean old build outputs to avoid stale cache
$buildDir = "$projectDir\android\app\build"
if (Test-Path $buildDir) {
  try {
    Remove-Item $buildDir -Recurse -Force -ErrorAction Stop
    Write-Host "  Cleaned old build directory" -ForegroundColor Green
  } catch {
    Write-Host "  WARNING: Could not fully clean build dir: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  Will continue with build (Gradle will overwrite changed files)" -ForegroundColor Yellow
  }
}
# Also clean assets/public to ensure fresh copy
$assetsDir = "$projectDir\android\app\src\main\assets\public"
if (Test-Path $assetsDir) {
  try {
    Remove-Item $assetsDir -Recurse -Force -ErrorAction Stop
    Write-Host "  Cleaned old assets/public directory" -ForegroundColor Green
  } catch {
    Write-Host "  WARNING: Could not clean assets dir: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}
$ErrorActionPreference = "Continue"
npx cap copy android 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "  Capacitor copy FAILED" -ForegroundColor Red
  exit 1
}
$ErrorActionPreference = "Stop"
Write-Host "  Capacitor synced" -ForegroundColor Green
Pop-Location
Write-Host ""

# ===== 4. Build APK =====
Write-Host "[4/8] Build APK..." -ForegroundColor Cyan
Push-Location "$projectDir\android"
& $gradleExe assembleRelease 2>&1 | ForEach-Object {
  $line = $_.ToString()
  if ($line -match "BUILD|FAIL|error:") { Write-Host "  $line" }
}
Pop-Location
$apkPath = "$projectDir\android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apkPath)) {
  Write-Host "  APK build FAILED" -ForegroundColor Red
  exit 1
}
$apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
Write-Host "  APK: $apkSize MB" -ForegroundColor Green
Write-Host ""

# ===== 5. Verify APK version =====
Write-Host "[5/8] Verify APK version..." -ForegroundColor Cyan
$verifyOk = $false
try {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::OpenRead($apkPath)
  $entry = $zip.Entries | Where-Object { $_.FullName -eq 'assets/public/js/config.js' }
  if ($entry) {
    $reader = New-Object System.IO.StreamReader($entry.Open())
    $configContent = $reader.ReadToEnd()
    $reader.Close()
    if ($configContent -match "version: '([^']+)'") {
      $apkVersion = $Matches[1]
      if ($apkVersion -eq $Version) {
        Write-Host "  Verified: APK contains v$apkVersion" -ForegroundColor Green
        $verifyOk = $true
      } else {
        Write-Host "  Version mismatch! APK has v$apkVersion, expected v$Version" -ForegroundColor Red
      }
    }
  } else {
    Write-Host "  WARNING: config.js not found in APK, skipping verification" -ForegroundColor Yellow
    $verifyOk = $true
  }
  $zip.Dispose()
} catch {
  Write-Host "  WARNING: Verification failed: $($_.Exception.Message)" -ForegroundColor Yellow
  $verifyOk = $true
}
if (-not $verifyOk) {
  Write-Host "  BUILD ABORTED: APK version verification failed" -ForegroundColor Red
  exit 1
}
Write-Host ""

# ===== 6. Copy APK =====
Write-Host "[6/8] Copy APK..." -ForegroundColor Cyan
Copy-Item $apkPath "$projectDir\apks\app-formal-latest.apk" -Force
Write-Host "  -> apks\app-formal-latest.apk" -ForegroundColor Green
Write-Host ""

# ===== 7. Git push + SCP upload + server deploy =====
Write-Host "[7/8] Git push & deploy to server..." -ForegroundColor Cyan
Push-Location $projectDir
$ErrorActionPreference = "Continue"
git add .gitignore package.json package-lock.json app/ server/ capacitor.config.json docker-compose.yml android/app/src/ android/app/build.gradle android/app/capacitor.build.gradle android/app/proguard-rules.pro android/capacitor.settings.gradle android/gradle.properties android/gradlew android/gradlew.bat android/settings.gradle android/variables.gradle 2>&1 | Out-Null
git commit -m "v${Version}: $($changeLines[0])" 2>&1 | Out-Null
git push 2>&1 | Out-Null
$ErrorActionPreference = "Stop"
Pop-Location
Write-Host "  Git pushed" -ForegroundColor Green

Write-Host "  Uploading APK via SCP..." -ForegroundColor Cyan
scp "$projectDir\apks\app-formal-latest.apk" "${server}:$remoteDir/apks/app-formal-latest.apk" 2>&1 | Out-Null
Write-Host "  APK uploaded" -ForegroundColor Green

$ErrorActionPreference = "Continue"
ssh $server "cd $remoteDir && git pull && docker compose restart" 2>&1 | ForEach-Object {
  $line = $_.ToString()
  if ($line.Trim()) { Write-Host "  $line" }
}
$ErrorActionPreference = "Stop"
Write-Host ""

# ===== 8. Health check =====
Write-Host "[8/8] Health check..." -ForegroundColor Cyan
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
