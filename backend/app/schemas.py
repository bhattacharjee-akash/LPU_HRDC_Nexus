from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

# --- Token & Security Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "participant"
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Program Schemas ---
class ProgramBase(BaseModel):
    title: str
    description: Optional[str] = None
    objectives: Optional[str] = None
    department: Optional[str] = None
    category: str  # FDP, Workshop, Refresher, Orientation, etc.
    mode: str = "offline"  # online, offline, hybrid
    venue: Optional[str] = None
    coordinator_id: Optional[str] = None
    start_date: datetime
    end_date: datetime
    duration_days: int = 1
    max_capacity: int = 50
    status: str = "upcoming"  # upcoming, active, completed, archived
    tags: Optional[str] = None

class ProgramCreate(ProgramBase):
    pass

class ProgramUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    objectives: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    mode: Optional[str] = None
    venue: Optional[str] = None
    coordinator_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    duration_days: Optional[int] = None
    max_capacity: Optional[int] = None
    status: Optional[str] = None
    tags: Optional[str] = None

class ProgramResponse(ProgramBase):
    id: int
    current_enrollment_count: int = 0

    class Config:
        from_attributes = True

# --- Session Schemas ---
class SessionBase(BaseModel):
    program_id: int
    session_number: int
    topic: str
    learning_objectives: Optional[str] = None
    start_time: datetime
    end_time: datetime
    venue: Optional[str] = None
    trainer_id: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    session_number: Optional[int] = None
    topic: Optional[str] = None
    learning_objectives: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    venue: Optional[str] = None
    trainer_id: Optional[str] = None

class SessionResponse(SessionBase):
    id: int

    class Config:
        from_attributes = True

# --- Enrollment Schemas ---
class EnrollmentBase(BaseModel):
    program_id: int
    user_id: str
    status: str = "enrolled"  # enrolled, pending_approval, completed, cancelled

class EnrollmentCreate(BaseModel):
    program_id: int

class EnrollmentResponse(EnrollmentBase):
    id: int
    enrolled_at: datetime

    class Config:
        from_attributes = True

# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    session_id: int
    user_id: str
    status: str = "present"  # present, absent, late
    verification_method: str = "manual"  # qr_code, manual, gps
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AttendanceCreate(BaseModel):
    session_id: int
    verification_method: str = "qr_code"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AttendanceResponse(AttendanceBase):
    id: int
    marked_at: datetime

    class Config:
        from_attributes = True

# --- Document Schemas ---
class DocumentBase(BaseModel):
    program_id: int
    session_id: Optional[int] = None
    title: str
    file_url: str
    file_type: str

class DocumentResponse(DocumentBase):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- Assessment Schemas ---
class AssessmentBase(BaseModel):
    session_id: int
    title: str
    type: str = "mcq"  # mcq, subjective, coding, case_study, file_upload
    content: str  # JSON representation of questions/answers or instructions
    max_marks: int = 100

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentResponse(AssessmentBase):
    id: int

    class Config:
        from_attributes = True

# --- Submission Schemas ---
class SubmissionBase(BaseModel):
    assessment_id: int
    user_id: str
    submission_data: str
    file_url: Optional[str] = None
    github_link: Optional[str] = None
    marks_obtained: Optional[float] = None
    feedback: Optional[str] = None

class SubmissionCreate(BaseModel):
    assessment_id: int
    submission_data: str
    file_url: Optional[str] = None
    github_link: Optional[str] = None

class SubmissionGrade(BaseModel):
    marks_obtained: float
    feedback: Optional[str] = None

class SubmissionResponse(SubmissionBase):
    id: int
    submitted_at: datetime

    class Config:
        from_attributes = True

# --- Feedback Schemas ---
class FeedbackBase(BaseModel):
    program_id: int
    session_id: Optional[int] = None
    feedback_type: str = "session"  # session, program
    rating_trainer: int = Field(..., ge=1, le=5)
    rating_content: int = Field(..., ge=1, le=5)
    rating_facilities: Optional[int] = Field(None, ge=1, le=5)
    comments: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(FeedbackBase):
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Certificate Schemas ---
class CertificateBase(BaseModel):
    program_id: int
    user_id: str
    certificate_hash: str
    file_url: str

class CertificateResponse(CertificateBase):
    id: int
    issued_at: datetime

    class Config:
        from_attributes = True

class CertificateVerifyResponse(BaseModel):
    valid: bool
    recipient_name: Optional[str] = None
    program_title: Optional[str] = None
    completion_date: Optional[datetime] = None
    certificate_url: Optional[str] = None

# --- Corporate Portal Schemas ---
class CorporateClientBase(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    phone: Optional[str] = None
    contract_url: Optional[str] = None
    billing_address: Optional[str] = None

class CorporateClientCreate(CorporateClientBase):
    pass

class CorporateClientResponse(CorporateClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    corporate_client_id: int
    program_id: int
    amount: float
    status: str = "unpaid"  # paid, unpaid, overdue
    due_date: datetime

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: int
    invoice_date: datetime

    class Config:
        from_attributes = True

# --- AI Chat / Agent Schemas ---
class ChatQuery(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
