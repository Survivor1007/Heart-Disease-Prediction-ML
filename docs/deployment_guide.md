# Deployment Guide: Neon PostgreSQL & Production Setup

## 1. Neon DB Setup
1. Create a serverless PostgreSQL database project at [neon.tech](https://neon.tech).
2. Copy the pooled connection string (with `-pooler`):
   ```
   postgresql+asyncpg://<username>:<password>@ep-cool-cloud-123456-pooler.us-east-2.aws.neon.tech/neondb?ssl=require
   ```
3. Set the `DATABASE_URL` in `backend/.env`.

## 2. Docker & Containerized Deployment
The backend can be built with the following Dockerfile:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python -m ml.train
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 3. Frontend Deployment (Vercel / Netlify)
1. Build static production assets:
   ```bash
   cd frontend
   npm run build
   ```
2. Set `VITE_API_URL` environment variable pointing to the deployed backend URL.
