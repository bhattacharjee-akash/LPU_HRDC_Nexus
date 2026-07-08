import datetime
from jose import jwt
from backend.app.auth import get_password_hash, verify_password, create_access_token
from backend.app.config import settings

def test_password_hashing():
    password = "SuperSecurePassword123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_generation():
    data = {"sub": "test@lpu.co.in", "role": "participant"}
    token = create_access_token(data)
    
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == "test@lpu.co.in"
    assert decoded["role"] == "participant"
    assert "exp" in decoded
