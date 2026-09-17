# PowerShell Backend Setup Script for Heart Disease CDSS
$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Heart Disease CDSS - Backend Setup (PowerShell)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "..\backend"
Set-Location $BackendDir

if (-not (Test-Path ".env")) {
    Write-Host "[.env] Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "[Python] Verifying Python..." -ForegroundColor Yellow
$pyVersion = python --version 2>&1
Write-Host "Found: $pyVersion" -ForegroundColor Green

if (-not (Test-Path "venv")) {
    Write-Host "[VENV] Creating Python virtual environment 'venv'..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "[VENV] Activating virtual environment..." -ForegroundColor Yellow
$activateScript = Join-Path $BackendDir "venv\Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
} else {
    & ".\venv\Scripts\activate"
}

Write-Host "[PIP] Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

Write-Host "[PIP] Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "[ML] Training models and generating artifacts..." -ForegroundColor Yellow
python -m ml.train

Write-Host "===================================================" -ForegroundColor Green
Write-Host " Backend setup completed successfully!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
