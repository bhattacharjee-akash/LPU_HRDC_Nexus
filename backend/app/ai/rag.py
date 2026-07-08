import os
import re
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from backend.app.models import DocumentChunk, Document
from backend.app import crud

# Initialize the embedding model
# This runs locally and does not require external API keys.
print("Loading HuggingFace embedding model: all-MiniLM-L6-v2...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Embedding model loaded successfully.")

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    # Simple chunker that splits on sentences or words
    words = text.split()
    chunks = []
    
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
        if i + chunk_size > len(words) and i < len(words):
            # Final chunk
            chunks.append(" ".join(words[i:]))
            break
            
    return [c.strip() for c in chunks if len(c.strip()) > 10]

def extract_text_from_file(file_path: str, file_type: str) -> str:
    # Handles text/markdown/txt files
    # For binary files like PDF/DOCX, it falls back gracefully to standard read or metadata.
    # In a full-production environment, you would use PyPDF2 or docx modules here.
    if file_type.lower() in ["txt", "md", "csv", "json"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception as e:
            return f"Failed to extract text from text file: {str(e)}"
    else:
        # Fallback text content parsing for binary formats
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                # Clean up binary garbage to leave readable text strings
                clean_content = re.sub(r'[^\x20-\x7E\n\t]', '', content)
                return clean_content[:10000] # Cap text for safety
        except Exception:
            return f"Binary training notes for document format: {file_type}."

def ingest_document(db: Session, document_id: int, file_path: str, file_type: str):
    # 1. Extract text from file
    text_content = extract_text_from_file(file_path, file_type)
    
    # 2. Chunk text
    chunks = chunk_text(text_content)
    if not chunks:
        # Avoid empty chunks; write a default description chunk
        chunks = [f"Metadata chunk for Document {document_id} of format {file_type}"]
        
    # 3. Generate embeddings
    embeddings = embedding_model.encode(chunks)
    
    # 4. Prepare data for db insertion
    chunk_records = []
    for chunk_text_str, emb in zip(chunks, embeddings):
        chunk_records.append({
            "text": chunk_text_str,
            "embedding": emb.tolist()
        })
        
    # 5. Insert chunks
    crud.create_document_chunks(db, document_id=document_id, chunks=chunk_records)
    print(f"Successfully chunked and indexed document ID {document_id} into vector space.")

def search_knowledge_base(db: Session, query: str, limit: int = 5) -> List[Dict[str, Any]]:
    # Generate query embedding
    query_emb = embedding_model.encode(query).tolist()
    
    # Query database for similar chunks
    similar_chunks = crud.search_similar_chunks(db, query_embedding=query_emb, limit=limit)
    
    results = []
    for chunk in similar_chunks:
        # Retrieve parent document information
        doc = db.query(Document).filter(Document.id == chunk.document_id).first()
        results.append({
            "chunk_id": chunk.id,
            "document_title": doc.title if doc else "Unknown Document",
            "file_url": doc.file_url if doc else "#",
            "text_content": chunk.text_content
        })
    return results
