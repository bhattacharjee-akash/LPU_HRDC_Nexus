from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app import crud, schemas, auth
from backend.app.models import User

router = APIRouter()

# --- Program Routes ---
@router.post("/", response_model=schemas.ProgramResponse, status_code=status.HTTP_201_CREATED)
def create_program(
    program: schemas.ProgramCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    return crud.create_program(db=db, program=program)

@router.get("/", response_model=List[schemas.ProgramResponse])
def read_programs(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    programs = crud.get_programs(db, skip=skip, limit=limit, category=category)
    # Calculate enrollment counts
    response_programs = []
    for p in programs:
        p_resp = schemas.ProgramResponse.model_validate(p)
        p_resp.current_enrollment_count = len(p.enrollments)
        response_programs.append(p_resp)
    return response_programs

@router.get("/{program_id}", response_model=schemas.ProgramResponse)
def read_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    db_program = crud.get_program(db, program_id=program_id)
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
    p_resp = schemas.ProgramResponse.model_validate(db_program)
    p_resp.current_enrollment_count = len(db_program.enrollments)
    return p_resp

# --- Session Routes ---
@router.post("/sessions", response_model=schemas.SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session: schemas.SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.trainer_required)
):
    # Verify program exists
    db_program = crud.get_program(db, program_id=session.program_id)
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
    return crud.create_session(db=db, session=session)

@router.get("/{program_id}/sessions", response_model=List[schemas.SessionResponse])
def read_sessions(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    return crud.get_sessions_by_program(db, program_id=program_id)

# --- Enrollment Routes ---
@router.post("/enroll", response_model=schemas.EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll_in_program(
    enrollment: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    # Verify program exists and has capacity
    db_program = crud.get_program(db, program_id=enrollment.program_id)
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    enrollment_count = len(db_program.enrollments)
    if enrollment_count >= db_program.max_capacity:
        raise HTTPException(status_code=400, detail="Program capacity reached")
        
    # Check if already enrolled
    existing = db.query(crud.Enrollment).filter(
        crud.Enrollment.program_id == enrollment.program_id,
        crud.Enrollment.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this program")
        
    return crud.create_enrollment(db=db, user_id=current_user.id, enrollment=enrollment)

@router.get("/my-enrollments", response_model=List[schemas.EnrollmentResponse])
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    return crud.get_enrollments_by_user(db, user_id=current_user.id)
