import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app import crud, schemas, auth
from backend.app.models import User

router = APIRouter()

@router.post("/", response_model=schemas.AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.trainer_required)
):
    return crud.create_assessment(db, assessment=assessment)

@router.get("/session/{session_id}", response_model=List[schemas.AssessmentResponse])
def get_session_assessments(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    return crud.get_assessments_by_session(db, session_id=session_id)

@router.post("/submit", response_model=schemas.SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assessment(
    submission: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    # Verify assessment exists
    db_assessment = db.query(crud.Assessment).filter(crud.Assessment.id == submission.assessment_id).first()
    if not db_assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    # Create submission in DB
    db_submission = crud.create_submission(db, user_id=current_user.id, submission=submission)
    
    # Auto Evaluation for MCQ assessments
    if db_assessment.type == "mcq":
        try:
            questions = json.loads(db_assessment.content)
            user_answers = json.loads(submission.submission_data).get("answers", [])
            
            correct_count = 0
            for idx, q in enumerate(questions):
                if idx < len(user_answers) and user_answers[idx] == q.get("ans"):
                    correct_count += 1
            
            total_questions = len(questions)
            calculated_marks = (correct_count / total_questions) * db_assessment.max_marks if total_questions > 0 else 0
            
            db_submission.marks_obtained = calculated_marks
            db_submission.feedback = f"Auto-graded: {correct_count} of {total_questions} questions correct."
            db.commit()
            db.refresh(db_submission)
        except Exception as e:
            print(f"MCQ Auto evaluation error: {str(e)}")
            
    return db_submission

@router.get("/{assessment_id}/submissions", response_model=List[schemas.SubmissionResponse])
def view_submissions(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.trainer_required)
):
    return crud.get_submissions_by_assessment(db, assessment_id=assessment_id)

@router.post("/grade/{submission_id}", response_model=schemas.SubmissionResponse)
def grade_submission(
    submission_id: int,
    grading: schemas.SubmissionGrade,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.trainer_required)
):
    db_submission = db.query(crud.Submission).filter(crud.Submission.id == submission_id).first()
    if not db_submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    db_submission.marks_obtained = grading.marks_obtained
    db_submission.feedback = grading.feedback
    db.commit()
    db.refresh(db_submission)
    return db_submission
