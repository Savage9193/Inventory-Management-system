from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.schemas.common import MessageResponse, ResponseModel
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=ResponseModel[AuthResponse])
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    result = AuthService(db).register(data)
    return ResponseModel(message="Registration successful", data=result)


@router.post("/login", response_model=ResponseModel[AuthResponse])
def login(data: LoginRequest, db: Session = Depends(get_db)):
    result = AuthService(db).login(data)
    return ResponseModel(message="Login successful", data=result)


@router.post("/refresh", response_model=ResponseModel[TokenResponse])
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    result = AuthService(db).refresh(data.refresh_token)
    return ResponseModel(message="Token refreshed", data=result)


@router.post("/logout", response_model=MessageResponse)
def logout(_: User = Depends(get_current_user)):
    return MessageResponse(message="Logged out successfully")
