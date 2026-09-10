from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.domain import User
from app.schemas.pydantic_schemas import LoginRequest, Token
from app.auth.jwt import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    role_name = user.role.name if user.role else "SALES"
    access_token = create_access_token(data={"sub": user.email, "role": role_name, "user_id": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role_name
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.name if current_user.role else "SALES"
    }
