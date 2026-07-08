from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import crud, schemas, auth
from backend.app.models import User, CorporateClient, Invoice

router = APIRouter()

@router.post("/clients", response_model=schemas.CorporateClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client: schemas.CorporateClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    return crud.create_corporate_client(db, client=client)

@router.get("/clients", response_model=List[schemas.CorporateClientResponse])
def get_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    return crud.get_corporate_clients(db, skip=skip, limit=limit)

@router.post("/invoices", response_model=schemas.InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    # Verify client exists
    client = db.query(CorporateClient).filter(CorporateClient.id == invoice.corporate_client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Corporate client not found")
    return crud.create_invoice(db, invoice=invoice)

@router.get("/invoices", response_model=List[schemas.InvoiceResponse])
def get_invoices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    return crud.get_invoices(db, skip=skip, limit=limit)

@router.post("/invoices/{invoice_id}/pay", response_model=schemas.InvoiceResponse)
def pay_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.staff_required)
):
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    db_invoice.status = "paid"
    db.commit()
    db.refresh(db_invoice)
    return db_invoice
