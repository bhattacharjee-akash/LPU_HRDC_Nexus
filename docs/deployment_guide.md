# Deployment and DevOps Manual

Instructions for deploying **LPU HRDC Nexus** to production cloud services.

---

## 1. Database Tier Configuration (Supabase)

1. Create a project on the **Supabase Dashboard**.
2. Navigate to **Database Settings** -> **Extensions** and ensure `vector` (pgvector) is enabled.
3. In SQL Editor, you can check that the connection is active.
4. Retrieve your connection string from the database configurations panel.

---

## 2. Local Container Deployment (Docker Compose)

To spin up the database, FastAPI, and Next.js containers locally:

```bash
# Provide your Groq key (optional for fallback mode)
$env:GROQ_API_KEY="gsk_..."

# Spin up multi-container ecosystem
docker-compose up --build
```
* Backend runs on `http://localhost:8000`
* Frontend runs on `http://localhost:3000`

---

## 3. Backend Deployment (Render)

1. Log in to **Render Dashboard** and click **New** -> **Web Service**.
2. Connect your GitHub repository containing the `LPU_HRDC_Nexus` workspace.
3. Select **Docker** environment runtime.
4. Set the Docker file path pointing to `backend/Dockerfile` and Build Context to `backend/`.
5. Under Environment variables, add:
   - `DATABASE_URL`: Your Supabase connection string.
   - `GROQ_API_KEY`: Your Groq platform secret.
   - `SECRET_KEY`: Long hash for JWT encryption.
6. Click **Deploy Web Service**.

---

## 4. Frontend Deployment (Vercel)

1. Import your repository into **Vercel**.
2. Set root directory configuration pointing to the `frontend/` subdirectory.
3. Vercel will automatically detect Next.js 15.
4. Add the environment variable:
   - `NEXT_PUBLIC_API_URL`: Set to `/api/v1` (to use the vercel.json proxy rewrite and avoid CORS) or direct URL of the Render backend.
5. Click **Deploy**.
