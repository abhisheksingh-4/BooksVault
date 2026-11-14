from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.api.dependencies import require_roles
from backend.app.database.session import get_db
from backend.app.models.models import Role, User
from backend.app.repositories.user_repository import UserRepository
from backend.app.schemas.schemas import LoginRequest, UserCreate, UserRoleUpdate
from backend.app.services.auth_service import AuthService

router = APIRouter(tags=["auth"])


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(payload.email, payload.password)


@router.get("/users")
def list_users(db: Session = Depends(get_db), current_user=Depends(require_roles("admin"))):
    users = db.query(User).all()
    return [{"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role} for user in users]


@router.post("/users")
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin"))):
    user = AuthService(db).create_user(payload)
    return {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    user = UserRepository(db).get_by_id(user_id)
    if user is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="User not found")
    user = UserRepository(db).update_role(user, payload.role)
    return {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}


@router.get("/roles")
def list_roles(db: Session = Depends(get_db), current_user=Depends(require_roles("admin"))):
    return [{"name": role.name} for role in db.query(Role).order_by(Role.name.asc()).all()]
