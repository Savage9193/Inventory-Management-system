from enum import Enum

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import verify_token
from app.database.session import get_db
from app.models.user import User, UserRole
from app.repositories.user import UserRepository

security = HTTPBearer(auto_error=False)


class Permission(str, Enum):
    READ_PRODUCTS = "read_products"
    MANAGE_PRODUCTS = "manage_products"
    MANAGE_CUSTOMERS = "manage_customers"
    MANAGE_ORDERS = "manage_orders"
    CREATE_ORDERS = "create_orders"
    VIEW_DASHBOARD = "view_dashboard"
    MANAGE_INVENTORY = "manage_inventory"
    FULL_ACCESS = "full_access"


ROLE_PERMISSIONS: dict[UserRole, set[Permission]] = {
    UserRole.ADMIN: {p for p in Permission},
    UserRole.MANAGER: {
        Permission.READ_PRODUCTS,
        Permission.MANAGE_PRODUCTS,
        Permission.MANAGE_CUSTOMERS,
        Permission.MANAGE_ORDERS,
        Permission.CREATE_ORDERS,
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_INVENTORY,
    },
    UserRole.STAFF: {
        Permission.READ_PRODUCTS,
        Permission.CREATE_ORDERS,
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_CUSTOMERS,
    },
}


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing authentication token")
    try:
        payload = verify_token(credentials.credentials, "access")
        user = UserRepository(db).get_by_id(int(payload["sub"]))
        if not user or not user.is_active:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
        return user
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc


def require_permissions(*permissions: Permission):
    def checker(user: User = Depends(get_current_user)) -> User:
        user_perms = ROLE_PERMISSIONS.get(user.role, set())
        if Permission.FULL_ACCESS in user_perms:
            return user
        if not any(p in user_perms for p in permissions):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return user

    return checker
