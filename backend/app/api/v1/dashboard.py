from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import Permission, require_permissions
from app.schemas.common import ResponseModel
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=ResponseModel[DashboardResponse])
def get_dashboard(
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.VIEW_DASHBOARD)),
):
    data = DashboardService(db).get_dashboard()
    return ResponseModel(data=data)
