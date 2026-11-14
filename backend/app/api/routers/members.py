from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.api.dependencies import get_current_user, require_roles
from backend.app.database.session import get_db
from backend.app.schemas.schemas import MemberCreate
from backend.app.services.member_service import MemberService

router = APIRouter(tags=["members"])


@router.get("/members")
def list_members(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    members = MemberService(db).list_members()
    return [{
        "id": m.id,
        "member_id": m.member_id,
        "name": m.name,
        "email": m.email,
        "phone": m.phone,
        "address": m.address,
        "status": m.status,
    } for m in members]


@router.post("/members")
def create_member(payload: MemberCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return MemberService(db).create_member(payload, current_user)


@router.get("/members/{member_id}")
def get_member(member_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    member = MemberService(db).get_member(member_id)
    if current_user.role == "member" and current_user.email != member["email"]:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Members may only view their own profile")
    return member


@router.put("/members/{member_id}")
def update_member(member_id: int, payload: MemberCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return MemberService(db).update_member(member_id, payload, current_user)


@router.delete("/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return MemberService(db).delete_member(member_id, current_user)


@router.get("/members/{member_id}/history")
def member_history(member_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    member = MemberService(db).get_member(member_id)
    if current_user.role == "member" and current_user.email != member["email"]:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Members may only view their own history")
    return MemberService(db).member_history(member_id)
