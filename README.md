# LPU HRDC Nexus: An AI-Powered Training Lifecycle Management Platform

LPU HRDC Nexus is an enterprise-grade training management system designed for the **Human Resource Development Center (HRDC)** at **Lovely Professional University (LPU)**. It manages the complete lifecycle of professional training, including Faculty Development Programmes (FDPs), workshops, certifications, corporate training, session tracking, assessments, feedback, and AI-enabled knowledge retrieval.

---

## 🚀 Key Modules & Features

### 📅 Training & Timetable Management
- Full support for FDPs, Workshops, Certifications, Refresher Courses, and Corporate Trainings.
- Dual view calendars (Daily, Weekly, Monthly) for coordinators, trainers, and participants.
- Automated room allocation and schedule clash detection.

### 📱 Attendance Module (PWA & Native-like)
- **Self-marking**: QR-code based self-attendance.
- **GPS Verification**: Configurable geolocation perimeter check for physical venue compliance.
- **HRDC Override**: Manual attendance override, late entry marking, and department-wise statistics.

### 📝 Assessments & Project Submissions
- Support for MCQs (auto-graded), Case Studies, Subjective tests, and Coding assignments.
- Leaderboards and detailed performance matrices.
- Project repositories with demo videos, presentation files, and abstract submissions.

### 📜 Certificate Generation
- Automatic PDF certificate generation upon meeting attendance thresholds (e.g. >= 75%).
- Cryptographic hash signature verification page.
- Secure QR code verification.

### 🤖 AI Knowledge Assistant & RAG
- Conversational assistant powered by **Groq** and orchestrated via **LangGraph**.
- Fully automated RAG pipeline indexing uploaded PPTs, PDFs, and code materials into **Supabase pgvector**.
- Ability to answer training audits, summarize courses, compile ratings, and outline analytics.

### 💼 Corporate & Vendor Portal
- Client management, vendor session scheduling, invoice billing, and contracts.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, Framer Motion, React Query, shadcn/ui.
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy 2.0, Alembic, Uvicorn.
- **Database & Storage**: Supabase PostgreSQL with `pgvector`, Supabase Storage, and Supabase Auth.
- **AI Orchestration**: LangGraph, Groq API, HuggingFace embeddings (`sentence-transformers`).

---

## 📂 Project Structure

```
LPU_HRDC_Nexus/
├── backend/            # FastAPI source code, database migrations & LangGraph models
├── frontend/           # Next.js frontend code & PWA assets
├── docs/               # Architecture, API & User manuals
├── docker-compose.yml  # Docker deployment configurations
├── vercel.json         # Vercel frontend routing and static configs
└── render.yaml         # Render backend infrastructure configuration
```
