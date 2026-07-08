from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app import auth
from backend.app.models import User, Program, Enrollment, Attendance, Certificate, Feedback, Invoice

router = APIRouter()

@router.get("/dashboard-stats")
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    total_programs = db.query(Program).count()
    completed_programs = db.query(Program).filter(Program.status == "completed").count()
    active_programs = db.query(Program).filter(Program.status == "active").count()
    upcoming_programs = db.query(Program).filter(Program.status == "upcoming").count()
    
    total_enrollments = db.query(Enrollment).count()
    total_certificates = db.query(Certificate).count()
    
    # Calculate average feedback score
    avg_trainer_rating = db.query(func.avg(Feedback.rating_trainer)).scalar()
    avg_content_rating = db.query(func.avg(Feedback.rating_content)).scalar()
    
    # Invoicing totals
    total_invoice_revenue = db.query(func.sum(Invoice.amount)).filter(Invoice.status == "paid").scalar() or 0.0
    
    return {
        "programs": {
            "total": total_programs,
            "active": active_programs,
            "completed": completed_programs,
            "upcoming": upcoming_programs
        },
        "participants": {
            "total_enrollments": total_enrollments,
            "certificates_issued": total_certificates
        },
        "ratings": {
            "avg_trainer": round(float(avg_trainer_rating), 2) if avg_trainer_rating else 0.0,
            "avg_content": round(float(avg_content_rating), 2) if avg_content_rating else 0.0
        },
        "revenue": {
            "corporate_earnings": round(float(total_invoice_revenue), 2)
        }
    }

@router.get("/department-participation")
def get_department_participation(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    # Participation per university department
    results = db.query(
        User.department,
        func.count(Enrollment.id).label("enrollments_count")
    ).join(Enrollment, User.id == Enrollment.user_id)\
     .group_by(User.department)\
     .order_by(func.count(Enrollment.id).desc())\
     .all()
     
    return [{"department": r.department or "Unknown", "count": r.enrollments_count} for r in results]

@router.get("/trainer-rankings")
def get_trainer_rankings(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    # Rank trainers by feedback score
    rankings = db.query(
        User.full_name,
        func.avg(Feedback.rating_trainer).label("avg_rating"),
        func.count(Feedback.id).label("feedback_count")
    ).join(Feedback, User.id == Feedback.user_id)\
     .group_by(User.id)\
     .order_by(func.avg(Feedback.rating_trainer).desc())\
     .all()
     
    return [
        {
            "trainer_name": r.full_name, 
            "average_rating": round(float(r.avg_rating), 2), 
            "feedback_count": r.feedback_count
        } for r in rankings
    ]
