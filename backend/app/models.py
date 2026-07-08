import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Enum, Table, Boolean
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # UUID string from Supabase Auth or custom ID
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="participant", nullable=False) # admin, staff, faculty, trainer, external_trainer, corporate_client, vendor, participant
    department = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="user")
    attendance_records = relationship("Attendance", back_populates="user")
    submissions = relationship("Submission", back_populates="user")
    feedback_given = relationship("Feedback", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")

class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    department = Column(String, nullable=True)
    category = Column(String, nullable=False) # FDP, Workshop, Orientation, Refresher, etc.
    mode = Column(String, default="offline") # online, offline, hybrid
    venue = Column(String, nullable=True)
    coordinator_id = Column(String, ForeignKey("users.id"), nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    duration_days = Column(Integer, default=1)
    max_capacity = Column(Integer, default=50)
    status = Column(String, default="upcoming") # upcoming, active, completed, archived
    tags = Column(String, nullable=True) # comma separated values

    # Relationships
    coordinator = relationship("User")
    sessions = relationship("Session", back_populates="program", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="program", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="program", cascade="all, delete-orphan")
    feedback_records = relationship("Feedback", back_populates="program", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="program", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="program")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    session_number = Column(Integer, nullable=False)
    topic = Column(String, nullable=False)
    learning_objectives = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    venue = Column(String, nullable=True)
    trainer_id = Column(String, ForeignKey("users.id"), nullable=True)

    # Relationships
    program = relationship("Program", back_populates="sessions")
    trainer = relationship("User")
    attendance = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="session", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="session", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="session", cascade="all, delete-orphan")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="enrolled") # enrolled, pending_approval, completed, cancelled
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    program = relationship("Program", back_populates="enrollments")
    user = relationship("User", back_populates="enrollments")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    marked_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="present") # present, absent, late
    verification_method = Column(String, default="manual") # qr_code, manual, gps
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Relationships
    session = relationship("Session", back_populates="attendance")
    user = relationship("User", back_populates="attendance_records")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)
    title = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # pdf, ppt, docx, txt, etc.
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    program = relationship("Program", back_populates="documents")
    session = relationship("Session", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    text_content = Column(Text, nullable=False)
    embedding = Column(Vector(384), nullable=False) # 384 dimensions matching sentence-transformers model

    # Relationships
    document = relationship("Document", back_populates="chunks")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    title = Column(String, nullable=False)
    type = Column(String, default="mcq") # mcq, subjective, coding, case_study, file_upload
    content = Column(Text, nullable=False) # JSON encoded questions or description
    max_marks = Column(Integer, default=100)

    # Relationships
    session = relationship("Session", back_populates="assessments")
    submissions = relationship("Submission", back_populates="assessment", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    submission_data = Column(Text, nullable=False) # Student response: JSON or plain text
    file_url = Column(String, nullable=True)
    github_link = Column(String, nullable=True)
    marks_obtained = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    assessment = relationship("Assessment", back_populates="submissions")
    user = relationship("User", back_populates="submissions")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    feedback_type = Column(String, default="session") # session, program
    rating_trainer = Column(Integer, nullable=False) # 1-5
    rating_content = Column(Integer, nullable=False) # 1-5
    rating_facilities = Column(Integer, nullable=True) # 1-5 (mostly program feedback)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    program = relationship("Program", back_populates="feedback_records")
    session = relationship("Session", back_populates="feedback")
    user = relationship("User", back_populates="feedback_given")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    certificate_hash = Column(String, unique=True, nullable=False, index=True)
    file_url = Column(String, nullable=False)
    issued_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    program = relationship("Program", back_populates="certificates")
    user = relationship("User", back_populates="certificates")

class CorporateClient(Base):
    __tablename__ = "corporate_clients"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False, index=True)
    contact_person = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    contract_url = Column(String, nullable=True)
    billing_address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    invoices = relationship("Invoice", back_populates="corporate_client")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    corporate_client_id = Column(Integer, ForeignKey("corporate_clients.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="unpaid") # paid, unpaid, overdue
    invoice_date = Column(DateTime, default=datetime.datetime.utcnow)
    due_date = Column(DateTime, nullable=False)

    # Relationships
    corporate_client = relationship("CorporateClient", back_populates="invoices")
    program = relationship("Program", back_populates="invoices")
