from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import math

from backend.app.database import get_db
from backend.app import crud, schemas, auth
from backend.app.models import User

router = APIRouter()

# LPU Campus Coordinates (default center point for geofencing check)
LPU_LAT = 31.2536
LPU_LON = 75.7037
ALLOWED_RADIUS_KM = 0.5  # 500 meters allowance

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Radius of the Earth in km
    R = 6371.0
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

@router.post("/mark", response_model=schemas.AttendanceResponse)
def self_mark_attendance(
    attendance: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    # Verify session exists
    db_session = crud.get_session(db, session_id=attendance.session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Check if participant is enrolled in the program
    enrolled = db.query(crud.Enrollment).filter(
        crud.Enrollment.program_id == db_session.program_id,
        crud.Enrollment.user_id == current_user.id
    ).first()
    if not enrolled and current_user.role not in ["admin", "staff", "trainer"]:
        raise HTTPException(status_code=403, detail="You are not enrolled in this program")

    # Geofence verification if GPS parameters are passed
    if attendance.latitude is not None and attendance.longitude is not None:
        distance = haversine_distance(attendance.latitude, attendance.longitude, LPU_LAT, LPU_LON)
        if distance > ALLOWED_RADIUS_KM:
            raise HTTPException(
                status_code=400,
                detail=f"GPS verification failed. You are {distance:.2f} km away from LPU Campus. Maximum allowed range is {ALLOWED_RADIUS_KM*1000}m."
            )
            
    return crud.mark_attendance(db=db, user_id=current_user.id, attendance=attendance)

@router.get("/session/{session_id}", response_model=List[schemas.AttendanceResponse])
def get_session_attendance(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.trainer_required)
):
    return crud.get_attendance_for_session(db, session_id=session_id)

@router.post("/override", response_model=schemas.AttendanceResponse)
def manual_override_attendance(
    record: schemas.AttendanceBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    # Retrieve or create attendance
    existing = db.query(crud.Attendance).filter(
        crud.Attendance.session_id == record.session_id,
        crud.Attendance.user_id == record.user_id
    ).first()
    
    if existing:
        existing.status = record.status
        existing.verification_method = "manual"
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_attendance = crud.Attendance(
            session_id=record.session_id,
            user_id=record.user_id,
            status=record.status,
            verification_method="manual"
        )
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        return db_attendance

@router.get("/program/{program_id}/user/{user_id}/stats")
def get_user_program_attendance_stats(
    program_id: int,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    # Enforce standard visibility limits
    if current_user.id != user_id and current_user.role not in ["admin", "staff", "trainer"]:
         raise HTTPException(status_code=403, detail="Permission denied")
         
    total_sessions = db.query(crud.ProgramSession).filter(crud.ProgramSession.program_id == program_id).count()
    if total_sessions == 0:
        return {"attendance_percentage": 100.0, "present": 0, "total_sessions": 0}
        
    records = crud.get_user_attendance_for_program(db, program_id=program_id, user_id=user_id)
    present_count = sum(1 for r in records if r.status == "present")
    percentage = (present_count / total_sessions) * 100
    
    return {
        "attendance_percentage": round(percentage, 2),
        "present": present_count,
        "total_sessions": total_sessions,
        "eligible_for_certificate": percentage >= 75.0
    }
