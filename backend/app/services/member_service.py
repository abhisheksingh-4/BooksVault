from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.models import Member, User
from backend.app.repositories.member_repository import MemberRepository


class MemberService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = MemberRepository(db)

    def list_members(self):
        return self.repository.list_members()

    def get_member(self, member_id: int):
        member = self.repository.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        return {
            "id": member.id,
            "member_id": member.member_id,
            "name": member.name,
            "email": member.email,
            "phone": member.phone,
            "address": member.address,
            "status": member.status,
        }

    def create_member(self, payload, current_user: User):
        if self.repository.get_by_email(payload.email):
            raise HTTPException(status_code=409, detail="Member with this email already exists")
        member = self.repository.create(
            member_id=payload.member_id,
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            address=payload.address,
        )
        return {
            "id": member.id,
            "member_id": member.member_id,
            "name": member.name,
            "email": member.email,
            "phone": member.phone,
            "address": member.address,
            "status": member.status,
        }

    def update_member(self, member_id: int, payload, current_user: User):
        member = self.repository.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        if payload.email != member.email and self.repository.get_by_email(payload.email):
            raise HTTPException(status_code=409, detail="Member with this email already exists")
        self.repository.update(member, member_id=payload.member_id, name=payload.name, email=payload.email, phone=payload.phone, address=payload.address)
        return {"message": "Member updated successfully"}

    def delete_member(self, member_id: int, current_user: User):
        member = self.repository.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        self.repository.delete(member)
        return {"message": "Member deleted successfully"}

    def member_history(self, member_id: int):
        member = self.repository.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        records = self.repository.history(member_id)
        return [{
            "id": issue.id,
            "book_id": issue.book_id,
            "book_title": issue.book.title if issue.book else None,
            "issue_date": issue.issue_date.isoformat(),
            "due_date": issue.due_date.isoformat() if issue.due_date else None,
            "return_date": issue.return_date.isoformat() if issue.return_date else None,
            "status": issue.status,
            "fine_amount": float(issue.fine_amount),
        } for issue in records]
