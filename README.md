# SurveyHub – Survey and Polling Builder

## Backend Setup (Local or Render)
1. Copy `backend/.env.example` to `backend/.env` and fill in `MONGO_URI` and JWT secrets.
2. Install dependencies and run:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Frontend Setup (Local or Vercel)
1. Optionally create `frontend/.env` with `VITE_API_URL=http://localhost:5000/api` (defaults to `http://localhost:5000/api` locally).
2. Install dependencies and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
