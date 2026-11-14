from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.models import BookIssue, Member


class MemberRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_members(self):
        return self.db.query(Member).all()

    def get_by_id(self, member_id: int) -> Member | None:
        return self.db.get(Member, member_id)

    def get_by_email(self, email: str) -> Member | None:
        return self.db.query(Member).filter(Member.email == email).first()

    def create(self, *, member_id: str, name: str, email: str, phone: str | None, address: str | None) -> Member:
        member = Member(member_id=member_id, name=name, email=email, phone=phone, address=address)
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def update(self, member: Member, *, member_id: str, name: str, email: str, phone: str | None, address: str | None) -> Member:
        existing_email = self.db.query(Member).filter(Member.email == email, Member.id != member.id).first()
        if existing_email:
            raise HTTPException(status_code=409, detail="Member with this email already exists")
        member.member_id = member_id
        member.name = name
        member.email = email
        member.phone = phone
        member.address = address
        self.db.commit()
        return member

    def delete(self, member: Member) -> None:
        if self.db.query(BookIssue).filter(BookIssue.member_id == member.id, BookIssue.status == "issued").count():
            raise HTTPException(status_code=409, detail="Cannot delete a member with active borrowed books")
        self.db.delete(member)
        self.db.commit()

    def history(self, member_id: int):
        return self.db.query(BookIssue).filter(BookIssue.member_id == member_id).order_by(BookIssue.issue_date.desc()).all()
