from __future__ import annotations

from sqlalchemy.orm import Session

from fastapi import HTTPException

from backend.app.models.models import Role, User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def create(self, *, full_name: str, email: str, password_hash: str, role: str = "admin") -> User:
        if self.get_by_email(email):
            raise HTTPException(status_code=409, detail="User with this email already exists")
        if self.db.get(Role, role) is None:
            raise HTTPException(status_code=400, detail="Invalid role")
        user = User(full_name=full_name, email=email, password_hash=password_hash, role=role)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_role(self, user: User, role: str) -> User:
        if self.db.get(Role, role) is None:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = role
        self.db.commit()
        self.db.refresh(user)
        return user
