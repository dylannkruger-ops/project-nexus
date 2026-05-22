# NEXUS AI OS — Complete Setup Script
# Run with: Right-click → "Run with PowerShell" (as Administrator)

$ErrorActionPreference = "Continue"
$ProjectPath = "C:\Users\neove\project-nexus"
$LogFile = "C:\Users\neove\Desktop\nexus-setup-log.txt"

function Log($msg) {
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line -ForegroundColor Cyan
    Add-Content $LogFile $line
}

function LogOK($msg)  { Write-Host "  ✓ $msg" -ForegroundColor Green;  Add-Content $LogFile "  OK: $msg" }
function LogErr($msg) { Write-Host "  ✗ $msg" -ForegroundColor Red;    Add-Content $LogFile "  ERR: $msg" }

Clear-Host
Write-Host ""
Write-Host "  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗" -ForegroundColor Magenta
Write-Host "  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝" -ForegroundColor Magenta
Write-Host "  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗" -ForegroundColor Magenta
Write-Host "  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║" -ForegroundColor Magenta
Write-Host "  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║" -ForegroundColor Magenta
Write-Host "  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝" -ForegroundColor Magenta
Write-Host ""
Write-Host "  AI Operating System — Windows Setup" -ForegroundColor White
Write-Host "  =====================================" -ForegroundColor DarkGray
Write-Host ""

New-Item -ItemType File -Path $LogFile -Force | Out-Null
Log "Setup started"

# ── PHASE 1: CHECK PREREQUISITES ─────────────────────────────────────────────

Log "PHASE 1 — Checking prerequisites"

# Node.js
$nodeOK = $false
try {
    $nodeVer = & node --version 2>$null
    if ($nodeVer) { LogOK "Node.js $nodeVer found"; $nodeOK = $true }
} catch {}

if (-not $nodeOK) {
    Log "Installing Node.js via winget..."
    winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
    $nodeVer = & node --version 2>$null
    if ($nodeVer) { LogOK "Node.js $nodeVer installed" } else { LogErr "Node.js install failed — download from nodejs.org then re-run" }
}

# Git
$gitOK = $false
try {
    $gitVer = & git --version 2>$null
    if ($gitVer) { LogOK "Git found: $gitVer"; $gitOK = $true }
} catch {}

if (-not $gitOK) {
    Log "Installing Git via winget..."
    winget install Git.Git --silent --accept-source-agreements --accept-package-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
    $gitVer = & git --version 2>$null
    if ($gitVer) { LogOK "Git installed: $gitVer" } else { LogErr "Git install failed — download from git-scm.com then re-run" }
}

# Docker
$dockerOK = $false
try {
    $dockerVer = & docker --version 2>$null
    if ($dockerVer) { LogOK "Docker found: $dockerVer"; $dockerOK = $true }
} catch {}

if (-not $dockerOK) {
    Log "Docker not found. Installing Docker Desktop..."
    winget install Docker.DockerDesktop --silent --accept-source-agreements --accept-package-agreements
    LogOK "Docker installed — starting Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Log "Waiting 30 seconds for Docker to start..."
    Start-Sleep -Seconds 30
}

# ── PHASE 2: CLONE REPO ───────────────────────────────────────────────────────

Log "PHASE 2 — Cloning NEXUS from GitHub"

Set-Location "C:\Users\neove"

if (Test-Path $ProjectPath) {
    LogOK "project-nexus folder exists — pulling latest changes"
    Set-Location $ProjectPath
    & git pull origin main
} else {
    Log "Cloning repo..."
    & git clone https://github.com/dylannkruger-ops/project-nexus
    if (Test-Path $ProjectPath) { LogOK "Repo cloned successfully" } else { LogErr "Clone failed — check internet connection" }
}

Set-Location $ProjectPath

# ── PHASE 3: NPM INSTALL ─────────────────────────────────────────────────────

Log "PHASE 3 — Installing Node.js dependencies"
& npm install
LogOK "Backend dependencies installed"

Log "Installing dashboard dependencies..."
Set-Location "$ProjectPath\dashboard"
& npm install
LogOK "Dashboard dependencies installed"
Set-Location $ProjectPath

# ── PHASE 4: SET UP .ENV ─────────────────────────────────────────────────────

Log "PHASE 4 — Setting up environment file"

if (-not (Test-Path "$ProjectPath\.env")) {
    Copy-Item "$ProjectPath\.env.example" "$ProjectPath\.env"
    LogOK ".env file created — add your API keys before running NEXUS"
} else {
    LogOK ".env already exists"
}

# ── PHASE 5: START DATABASES ─────────────────────────────────────────────────

Log "PHASE 5 — Starting Redis and PostgreSQL"

# Try starting existing containers first
& docker start nexus-redis 2>$null
if ($LASTEXITCODE -ne 0) {
    Log "Creating Redis container..."
    & docker run -d --name nexus-redis --restart unless-stopped -p 6379:6379 redis:alpine
    LogOK "Redis container created"
} else {
    LogOK "Redis started"
}

& docker start nexus-postgres 2>$null
if ($LASTEXITCODE -ne 0) {
    Log "Creating PostgreSQL container..."
    & docker run -d --name nexus-postgres --restart unless-stopped -p 5432:5432 -e POSTGRES_PASSWORD=nexuspass -e POSTGRES_DB=nexus postgres:16
    LogOK "PostgreSQL container created"
} else {
    LogOK "PostgreSQL started"
}

Start-Sleep -Seconds 5

# Verify
$running = & docker ps --format "{{.Names}}" 2>$null
if ($running -match "nexus-redis")    { LogOK "Redis is running" }    else { LogErr "Redis failed to start" }
if ($running -match "nexus-postgres") { LogOK "PostgreSQL is running" } else { LogErr "PostgreSQL failed to start" }

# ── PHASE 6: CREATE START SCRIPT ─────────────────────────────────────────────

Log "PHASE 6 — Creating NEXUS-START.bat on Desktop"

$startScript = @"
@echo off
title NEXUS AI OS
color 0A
echo.
echo  Starting NEXUS AI OS...
echo.
echo  Starting databases...
docker start nexus-redis
docker start nexus-postgres
timeout /t 3 /nobreak >nul

echo  Starting dashboard...
start "NEXUS Dashboard" cmd /k "cd /d C:\Users\neove\project-nexus\dashboard && npm run dev"
timeout /t 3 /nobreak >nul

echo  Starting backend...
echo.
echo  Dashboard: http://localhost:5173
echo  Backend:   http://localhost:3001
echo.
cd /d C:\Users\neove\project-nexus
npm run dev
"@

$startScript | Out-File -FilePath "C:\Users\neove\Desktop\NEXUS-START.bat" -Encoding ASCII
LogOK "NEXUS-START.bat created on Desktop"

# ── PHASE 7: CREATE DESKTOP SHORTCUT ─────────────────────────────────────────

Log "PHASE 7 — Creating Desktop shortcut for dashboard"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\neove\Desktop\NEXUS Dashboard.url")
$Shortcut.TargetPath = "http://localhost:5173"
$Shortcut.Save()
LogOK "NEXUS Dashboard shortcut created on Desktop"

# ── PHASE 8: OPEN .ENV FOR API KEYS ──────────────────────────────────────────

Log "PHASE 8 — Opening .env file for API key entry"
Start-Process notepad.exe "$ProjectPath\.env"

# ── DONE ─────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "  ════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   NEXUS SETUP COMPLETE" -ForegroundColor White
Write-Host "  ════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "   What to do now:" -ForegroundColor White
Write-Host ""
Write-Host "   1. Add your API keys to the .env file" -ForegroundColor Yellow
Write-Host "      that just opened in Notepad" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   2. Double-click NEXUS-START.bat" -ForegroundColor Yellow
Write-Host "      on your Desktop to launch NEXUS" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   3. Open http://localhost:5173" -ForegroundColor Yellow
Write-Host "      to see the PULSE dashboard" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Log saved to: $LogFile" -ForegroundColor DarkGray
Write-Host "  ════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Log "Setup complete"
Read-Host "Press Enter to close"
