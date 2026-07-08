from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from backend.app.database import get_db
from backend.app import crud, schemas, auth
from backend.app.models import User, Feedback

router = APIRouter()

@router.post("/", response_model=schemas.FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    # Verify enrollment if not staff/trainer/admin
    enrolled = db.query(crud.Enrollment).filter(
        crud.Enrollment.program_id == feedback.program_id,
        crud.Enrollment.user_id == current_user.id
    ).first()
    if not enrolled and current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="You are not enrolled in this program")
        
    return crud.create_feedback(db, user_id=current_user.id, feedback=feedback)

@router.get("/program/{program_id}/stats")
def get_program_feedback_stats(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.trainer_required)
):
    # Aggregate scores
    stats = db.query(
        func.avg(Feedback.rating_trainer).label("avg_trainer"),
        func.avg(Feedback.rating_content).label("avg_content"),
        func.avg(Feedback.rating_facilities).label("avg_facilities"),
        func.count(Feedback.id).label("total_feedback")
    ).filter(Feedback.program_id == program_id).first()
    
    if not stats or stats.total_feedback == 0:
        return {
            "avg_trainer": 0.0,
            "avg_content": 0.0,
            "avg_facilities": 0.0,
            "total_feedback": 0
        }
        
    return {
        "avg_trainer": round(float(stats.avg_trainer), 2) if stats.avg_trainer else 0.0,
        "avg_content": round(float(stats.avg_content), 2) if stats.avg_content else 0.0,
        "avg_facilities": round(float(stats.avg_facilities), 2) if stats.avg_facilities else 0.0,
        "total_feedback": int(stats.total_feedback)
    }
