import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "LPU HRDC Nexus"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "78d1fb7e34ef62ba76a6e7681c2f90a9b6c085de51ad51892dfd6a89efb36ad5")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Supabase / Postgres DB URL
    # Format: postgresql://postgres:[password]@db.[supabase-project].supabase.co:5432/postgres
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/lpu_hrdc")
    
    # Groq API Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama3-70b-8192"
    
    # Embedding Configuration (local HuggingFace model)
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # Admin Credentials for Seeding
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@lpu.co.in")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "AdminLPU2026!")

    class Config:
        case_sensitive = True

settings = Settings()
