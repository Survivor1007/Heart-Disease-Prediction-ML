#!/usr/bin/env bash
set -e

echo "==================================================="
echo " Heart Disease CDSS - Backend Setup (Unix/macOS)"
echo "==================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../backend"

if [ ! -f .env ]; then
    echo "[.env] Creating .env from .env.example..."
    cp .env.example .env
fi

if [ ! -d "venv" ]; then
    echo "[VENV] Creating Python virtual environment 'venv'..."
    python3 -m venv venv || python -m venv venv
fi

echo "[VENV] Activating virtual environment..."
source venv/bin/activate

echo "[PIP] Upgrading pip..."
python -m pip install --upgrade pip

echo "[PIP] Installing dependencies from requirements.txt..."
pip install -r requirements.txt

echo "[ML] Training models and generating artifacts..."
python -m ml.train

echo "==================================================="
echo " Backend setup completed successfully!"
echo "==================================================="
