from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import schemas, auth
from backend.app.models import User
from backend.app.ai.workflow import query_hrdc_assistant

router = APIRouter()

@router.post("/query", response_model=schemas.ChatResponse)
def execute_ai_query(
    payload: schemas.ChatQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    result = query_hrdc_assistant(db, query_text=payload.query)
    return schemas.ChatResponse(
        response=result["response"],
        sources=result["sources"]
    )
