# MooFlow frontend

Responsive Next.js dashboard for the Dairy Farm Management API.

## Run locally

1. Start PostgreSQL and the Spring API from `../backend`.
2. Copy `.env.example` to `.env.local` if the API is not at `http://localhost:8080`.
3. Install dependencies and start the frontend:

   ```powershell
   npm install
   npm run dev
   ```

Open `http://localhost:3000`. Next.js proxies `/api/*` requests to `API_BACKEND_URL`, so the browser can use the Spring API without separate CORS configuration.

The overview currently reads `/api/cattle` and `/api/milk-productions` and shows connection errors when the backend is unavailable.
