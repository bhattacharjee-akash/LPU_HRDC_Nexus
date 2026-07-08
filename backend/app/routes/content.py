import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app import crud, schemas, auth
from backend.app.models import User
from backend.app.ai.rag import ingest_document, search_knowledge_base

router = APIRouter()

# Local upload directory setup
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    program_id: int = Form(...),
    session_id: Optional[int] = Form(None),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.trainer_required)
):
    # Verify program exists
    db_program = crud.get_program(db, program_id=program_id)
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    # Save file to uploads folder
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "dat"
    file_name = f"{program_id}_{title.replace(' ', '_')}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    # Register document in DB
    doc_schema = schemas.DocumentBase(
        program_id=program_id,
        session_id=session_id,
        title=title,
        file_url=f"/uploads/{file_name}",
        file_type=file_ext
    )
    db_doc = crud.create_document(db, doc=doc_schema)
    
    # Process document into pgvector chunks asynchronously/synchronously
    try:
        ingest_document(db, document_id=db_doc.id, file_path=file_path, file_type=file_ext)
    except Exception as e:
        print(f"RAG Indexing Error: {str(e)}")
        # Continue even if indexing fails to avoid blocking the upload process
        
    return db_doc

@router.get("/program/{program_id}", response_model=List[schemas.DocumentResponse])
def get_program_documents(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    return crud.get_documents_by_program(db, program_id=program_id)

@router.get("/search")
def search_docs(
    query: str,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.any_authorized)
):
    return search_knowledge_base(db, query=query, limit=limit)
