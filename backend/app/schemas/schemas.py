from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class BookCreate(BaseModel):
    isbn: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    author_name: str = Field(min_length=1, max_length=255)
    publisher_name: str = Field(min_length=1, max_length=255)
    category_name: str = Field(min_length=1, max_length=255)
    edition: str | None = None
    language: str | None = None
    quantity: int = Field(default=1, ge=0)
    rack_number: str | None = None


class MemberCreate(BaseModel):
    member_id: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    phone: str | None = None
    address: str | None = None


class IssueBookRequest(BaseModel):
    member_id: int
    due_days: int = Field(default=14, ge=1)


class ReturnBookRequest(BaseModel):
    member_id: int


class BookUpdate(BaseModel):
    isbn: str | None = None
    title: str | None = None
    author_name: str | None = None
    publisher_name: str | None = None
    category_name: str | None = None
    edition: str | None = None
    language: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    rack_number: str | None = None


class CatalogCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    bio: str | None = None
    address: str | None = None


class CatalogUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    bio: str | None = None
    address: str | None = None


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: Literal["admin", "librarian", "member"] = "member"


class UserRoleUpdate(BaseModel):
    role: Literal["admin", "librarian", "member"]


class AuthResponse(BaseModel):
    token: str
    user: dict
