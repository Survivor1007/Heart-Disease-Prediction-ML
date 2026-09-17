@echo off
echo ===================================================
echo  Starting Heart Disease CDSS - FastAPI Backend
echo ===================================================
cd /d "%~dp0..\backend"
call venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
