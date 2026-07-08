import uuid
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from backend.app.models import (
    User, Program, Session as ProgramSession, Enrollment, Attendance,
    Document, DocumentChunk, Assessment, Submission, Feedback, Certificate,
    CorporateClient, Invoice
)
from backend.app.schemas import (
    UserCreate, ProgramCreate, SessionCreate, EnrollmentCreate,
    AttendanceCreate, DocumentBase, AssessmentCreate, SubmissionCreate,
    FeedbackCreate, CorporateClientCreate, InvoiceCreate
)
from backend.app.auth import get_password_hash

# --- User CRUD ---
def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        role=user.role,
        department=user.department
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Program CRUD ---
def get_program(db: Session, program_id: int):
    return db.query(Program).filter(Program.id == program_id).first()

def get_programs(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None):
    query = db.query(Program)
    if category:
        query = query.filter(Program.category == category)
    return query.offset(skip).limit(limit).all()

def create_program(db: Session, program: ProgramCreate):
    db_program = Program(**program.model_dump())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

# --- Session CRUD ---
def get_session(db: Session, session_id: int):
    return db.query(ProgramSession).filter(ProgramSession.id == session_id).first()

def get_sessions_by_program(db: Session, program_id: int):
    return db.query(ProgramSession).filter(ProgramSession.program_id == program_id).order_by(ProgramSession.session_number).all()

def create_session(db: Session, session: SessionCreate):
    db_session = ProgramSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

# --- Enrollment CRUD ---
def get_enrollments_by_user(db: Session, user_id: str):
    return db.query(Enrollment).filter(Enrollment.user_id == user_id).all()

def get_enrollments_by_program(db: Session, program_id: int):
    return db.query(Enrollment).filter(Enrollment.program_id == program_id).all()

def create_enrollment(db: Session, user_id: str, enrollment: EnrollmentCreate):
    db_enrollment = Enrollment(
        program_id=enrollment.program_id,
        user_id=user_id,
        status="enrolled"
    )
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

# --- Attendance CRUD ---
def get_attendance_for_session(db: Session, session_id: int):
    return db.query(Attendance).filter(Attendance.session_id == session_id).all()

def get_user_attendance_for_program(db: Session, program_id: int, user_id: str):
    return db.query(Attendance)\
        .join(ProgramSession)\
        .filter(ProgramSession.program_id == program_id, Attendance.user_id == user_id)\
        .all()

def mark_attendance(db: Session, user_id: str, attendance: AttendanceCreate):
    # Check if attendance already exists
    existing = db.query(Attendance).filter(
        Attendance.session_id == attendance.session_id,
        Attendance.user_id == user_id
    ).first()
    if existing:
        return existing
        
    db_attendance = Attendance(
        session_id=attendance.session_id,
        user_id=user_id,
        verification_method=attendance.verification_method,
        latitude=attendance.latitude,
        longitude=attendance.longitude,
        status="present"
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

# --- Document & Vector Chunk CRUD ---
def create_document(db: Session, doc: DocumentBase):
    db_doc = Document(**doc.model_dump())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

def get_documents_by_program(db: Session, program_id: int):
    return db.query(Document).filter(Document.program_id == program_id).all()

def get_documents_by_session(db: Session, session_id: int):
    return db.query(Document).filter(Document.session_id == session_id).all()

def create_document_chunks(db: Session, document_id: int, chunks: List[dict]):
    db_chunks = []
    for chunk in chunks:
        db_chunk = DocumentChunk(
            document_id=document_id,
            text_content=chunk["text"],
            embedding=chunk["embedding"]
        )
        db.add(db_chunk)
        db_chunks.append(db_chunk)
    db.commit()
    return db_chunks

def search_similar_chunks(db: Session, query_embedding: List[float], limit: int = 5):
    # Call pgvector similarity search
    # Using L2 distance or cosine distance. cosine distance is 1 - cosine similarity.
    # pgvector supports embedding.cosine_distance(query_embedding)
    return db.query(DocumentChunk)\
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))\
        .limit(limit)\
        .all()

# --- Assessment CRUD ---
def create_assessment(db: Session, assessment: AssessmentCreate):
    db_assessment = Assessment(**assessment.model_dump())
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

def get_assessments_by_session(db: Session, session_id: int):
    return db.query(Assessment).filter(Assessment.session_id == session_id).all()

def create_submission(db: Session, user_id: str, submission: SubmissionCreate):
    db_submission = Submission(
        assessment_id=submission.assessment_id,
        user_id=user_id,
        submission_data=submission.submission_data,
        file_url=submission.file_url,
        github_link=submission.github_link
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

def get_submissions_by_assessment(db: Session, assessment_id: int):
    return db.query(Submission).filter(Submission.assessment_id == assessment_id).all()

# --- Feedback CRUD ---
def create_feedback(db: Session, user_id: str, feedback: FeedbackCreate):
    db_feedback = Feedback(
        program_id=feedback.program_id,
        session_id=feedback.session_id,
        user_id=user_id,
        feedback_type=feedback.feedback_type,
        rating_trainer=feedback.rating_trainer,
        rating_content=feedback.rating_content,
        rating_facilities=feedback.rating_facilities,
        comments=feedback.comments
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def get_feedback_for_program(db: Session, program_id: int):
    return db.query(Feedback).filter(Feedback.program_id == program_id).all()

# --- Certificate CRUD ---
def create_certificate(db: Session, program_id: int, user_id: str, certificate_hash: str, file_url: str):
    db_cert = Certificate(
        program_id=program_id,
        user_id=user_id,
        certificate_hash=certificate_hash,
        file_url=file_url
    )
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

def get_certificate_by_hash(db: Session, certificate_hash: str):
    return db.query(Certificate).filter(Certificate.certificate_hash == certificate_hash).first()

# --- Corporate Portal CRUD ---
def create_corporate_client(db: Session, client: CorporateClientCreate):
    db_client = CorporateClient(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def get_corporate_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CorporateClient).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice: InvoiceCreate):
    db_invoice = Invoice(**invoice.model_dump())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Invoice).offset(skip).limit(limit).all()
