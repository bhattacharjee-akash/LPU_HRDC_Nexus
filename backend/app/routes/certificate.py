import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import crud, schemas, auth
from backend.app.models import User, Certificate, Program

router = APIRouter()

@router.post("/generate/{program_id}", response_model=schemas.CertificateResponse)
def generate_program_certificate(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    # 1. Verify program exists
    db_program = crud.get_program(db, program_id=program_id)
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    # 2. Check if already generated
    existing = db.query(Certificate).filter(
        Certificate.program_id == program_id,
        Certificate.user_id == current_user.id
    ).first()
    if existing:
        return existing
        
    # 3. Calculate attendance percentage
    total_sessions = db.query(crud.ProgramSession).filter(crud.ProgramSession.program_id == program_id).count()
    if total_sessions == 0:
        raise HTTPException(status_code=400, detail="Cannot issue certificates for program without sessions")
        
    records = crud.get_user_attendance_for_program(db, program_id=program_id, user_id=current_user.id)
    present_count = sum(1 for r in records if r.status == "present")
    percentage = (present_count / total_sessions) * 100
    
    if percentage < 75.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ineligible for certificate. Attendance is {percentage:.1f}%. Required: 75.0%"
        )
        
    # 4. Generate certificate hash
    hash_payload = f"{program_id}:{current_user.id}:{current_user.email}"
    certificate_hash = hashlib.sha256(hash_payload.encode()).hexdigest()
    
    # URL to certificate template (frontend can render PDF based on hash)
    file_url = f"/certificates/verify/{certificate_hash}"
    
    return crud.create_certificate(
        db, 
        program_id=program_id, 
        user_id=current_user.id, 
        certificate_hash=certificate_hash, 
        file_url=file_url
    )

@router.get("/verify/{certificate_hash}", response_model=schemas.CertificateVerifyResponse)
def verify_hash(certificate_hash: str, db: Session = Depends(get_db)):
    db_cert = crud.get_certificate_by_hash(db, certificate_hash=certificate_hash)
    if not db_cert:
        return schemas.CertificateVerifyResponse(valid=False)
        
    recipient = db.query(User).filter(User.id == db_cert.user_id).first()
    program = db.query(Program).filter(Program.id == db_cert.program_id).first()
    
    return schemas.CertificateVerifyResponse(
        valid=True,
        recipient_name=recipient.full_name if recipient else "LPU Faculty Participant",
        program_title=program.title if program else "HRDC Development Programme",
        completion_date=db_cert.issued_at,
        certificate_url=db_cert.file_url
    )

@router.get("/my-certificates", response_model=List[schemas.CertificateResponse])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    return db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
