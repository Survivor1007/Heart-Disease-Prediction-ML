@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo  Heart Disease CDSS - Backend Setup
echo ===================================================

cd /d "%~dp0..\backend"

if not exist .env (
    echo [.env] Creating .env from .env.example...
    copy .env.example .env
)

echo [Python] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

if not exist venv (
    echo [VENV] Creating Python virtual environment 'venv'...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

echo [VENV] Activating virtual environment...
call venv\Scripts\activate

echo [PIP] Upgrading pip...
python -m pip install --upgrade pip

echo [PIP] Installing backend dependencies from requirements.txt...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
)

echo [ML] Training models, calibrators, and generating explainability artifacts...
python -m ml.train
if %errorlevel% neq 0 (
    echo [ERROR] ML training pipeline failed.
    pause
    exit /b 1
)

echo ===================================================
echo  Backend setup completed successfully!
echo  You can now run scripts\run_backend.bat to start.
echo ===================================================
