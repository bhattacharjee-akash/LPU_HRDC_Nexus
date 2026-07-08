from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User
from backend.app.auth import get_password_hash
from backend.app.routes import (
    auth, program, attendance, content, assessment, certificate, corporate, feedback, analytics, ai
)

# Initialize database tables
# In production, Alembic migrations should run, but for rapid robust deployment
# we ensure the schema is initialized if tables are missing.
print("Initializing database tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Database schema initialization warning/error: {str(e)}")

# Seed Default Users if none exist
def seed_database():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            print(f"Seeding default admin user: {settings.ADMIN_EMAIL}...")
            new_admin = User(
                id="seed-admin-uuid-101",
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name="LPU HRDC Director",
                role="admin",
                department="HRDC Administration"
            )
            db.add(new_admin)
            
            # Also seed a mock trainer
            new_trainer = User(
                id="seed-trainer-uuid-102",
                email="trainer@lpu.co.in",
                hashed_password=get_password_hash("TrainerLPU2026!"),
                full_name="Dr. Rajesh Sharma",
                role="trainer",
                department="School of Computer Science"
            )
            db.add(new_trainer)
            
            # Seed a mock participant
            new_participant = User(
                id="seed-participant-uuid-103",
                email="participant@lpu.co.in",
                hashed_password=get_password_hash("ParticipantLPU2026!"),
                full_name="Mr. Aman Singh",
                role="participant",
                department="School of Mechanical Engineering"
            )
            db.add(new_participant)
            
            db.commit()
            print("Database seeding completed.")
    except Exception as e:
        print(f"Database seeding warning/error: {str(e)}")
    finally:
        db.close()

seed_database()

# Create FastAPI app instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain e.g. ["https://lpu-hrdc-nexus.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(program.router, prefix=f"{settings.API_V1_STR}/programs", tags=["Programs & Sessions"])
app.include_router(attendance.router, prefix=f"{settings.API_V1_STR}/attendance", tags=["Attendance Tracking"])
app.include_router(content.router, prefix=f"{settings.API_V1_STR}/content", tags=["Content RAG Management"])
app.include_router(assessment.router, prefix=f"{settings.API_V1_STR}/assessments", tags=["Assessments & Grades"])
app.include_router(certificate.router, prefix=f"{settings.API_V1_STR}/certificates", tags=["Certificate Issuance"])
app.include_router(corporate.router, prefix=f"{settings.API_V1_STR}/corporate", tags=["Corporate & Billing"])
app.include_router(feedback.router, prefix=f"{settings.API_V1_STR}/feedback", tags=["Feedback Survey"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Reporting & Analytics"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI Reasoning Agent"])

# Healthcheck
@app.get("/")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}

# Serving uploaded files locally (e.g. PDFs, notes)
from fastapi.staticfiles import StaticFiles
uploads_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
if os.path.exists(uploads_path):
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")
