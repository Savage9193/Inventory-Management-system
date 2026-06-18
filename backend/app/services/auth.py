from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.models.user import User, UserRole
from app.repositories.user import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db

    def register(self, data: RegisterRequest) -> AuthResponse:
        if self.repo.get_by_email(data.email):
            raise AppException("Email already registered", 409)

        role = data.role
        has_admin = self.db.query(User).filter(User.role == UserRole.ADMIN).count() > 0
        if not has_admin:
            role = UserRole.ADMIN
        elif role == UserRole.ADMIN:
            raise AppException("Cannot register as admin", 403)

        user = self.repo.create(data.email, data.password, data.full_name, role)
        self.db.commit()
        self.db.refresh(user)
        return self._build_auth_response(user)

    def login(self, data: LoginRequest) -> AuthResponse:
        user = self.repo.authenticate(data.email, data.password)
        if not user:
            raise AppException("Invalid credentials", 401)
        return self._build_auth_response(user)

    def refresh(self, refresh_token: str) -> TokenResponse:
        payload = verify_token(refresh_token, "refresh")
        user = self.repo.get_by_id(int(payload["sub"]))
        if not user or not user.is_active:
            raise AppException("Invalid refresh token", 401)
        return TokenResponse(
            access_token=create_access_token(str(user.id), user.role.value),
            refresh_token=create_refresh_token(str(user.id)),
        )

    def logout(self) -> None:
        return None

    def _build_auth_response(self, user) -> AuthResponse:
        return AuthResponse(
            user=UserResponse.model_validate(user),
            tokens=TokenResponse(
                access_token=create_access_token(str(user.id), user.role.value),
                refresh_token=create_refresh_token(str(user.id)),
            ),
        )
