from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.api.dependencies import require_roles
from backend.app.database.session import get_db
from backend.app.services.dashboard_service import DashboardService

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return DashboardService(db).dashboard()


@router.get("/reports")
def reports(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return DashboardService(db).reports()


@router.get("/activity-logs")
def activity_logs(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    from backend.app.models.models import ActivityLog

    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).all()
    return [{
        "id": log.id,
        "user_id": log.user_id,
        "action": log.action,
        "entity_type": log.entity_type,
        "details": log.details,
        "created_at": log.created_at.isoformat(),
    } for log in logs]


@router.get("/fines")
def list_fines(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    from backend.app.models.models import Fine

    fines = db.query(Fine).all()
    return [{"id": f.id, "member_id": f.member_id, "amount": float(f.amount), "paid": f.paid, "created_at": f.created_at.isoformat()} for f in fines]
