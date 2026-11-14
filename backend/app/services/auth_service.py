from __future__ import annotations

from datetime import datetime, timedelta

import bcrypt
import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.config import get_settings
from backend.app.repositories.user_repository import UserRepository

settings = get_settings()


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

    def login(self, email: str, password: str):
        user = UserRepository(self.db).get_by_email(email)
        if not user or not self.verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return {"token": self.create_token(user), "user": {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}}

    def create_user(self, payload):
        return UserRepository(self.db).create(
            full_name=payload.full_name,
            email=payload.email,
            password_hash=self.hash_password(payload.password),
            role=payload.role,
        )

    @staticmethod
    def create_token(user) -> str:
        payload = {"sub": user.email, "role": user.role, "exp": datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)}
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
