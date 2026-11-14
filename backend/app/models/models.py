from __future__ import annotations

from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base


class Role(Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), primary_key=True)

    users: Mapped[list["User"]] = relationship(back_populates="role_record")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(default="Administrator")
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), ForeignKey("roles.name"), default="admin")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    role_record: Mapped[Role] = relationship(back_populates="users")
    activity_logs: Mapped[list["ActivityLog"]] = relationship(back_populates="user")
    book_issues: Mapped[list["BookIssue"]] = relationship(back_populates="issued_by_user")


class Author(Base):
    __tablename__ = "authors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    bio: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    books: Mapped[list["Book"]] = relationship(back_populates="author")


class Publisher(Base):
    __tablename__ = "publishers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    address: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    books: Mapped[list["Book"]] = relationship(back_populates="publisher")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    books: Mapped[list["Book"]] = relationship(back_populates="category")


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    isbn: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    edition: Mapped[str | None] = mapped_column(default=None)
    language: Mapped[str | None] = mapped_column(default=None)
    quantity: Mapped[int] = mapped_column(default=0)
    available_quantity: Mapped[int] = mapped_column(default=0)
    rack_number: Mapped[str | None] = mapped_column(default=None)
    author_id: Mapped[int | None] = mapped_column(ForeignKey("authors.id"), nullable=True)
    publisher_id: Mapped[int | None] = mapped_column(ForeignKey("publishers.id"), nullable=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    author: Mapped[Author | None] = relationship(back_populates="books")
    publisher: Mapped[Publisher | None] = relationship(back_populates="books")
    category: Mapped[Category | None] = relationship(back_populates="books")
    issues: Mapped[list["BookIssue"]] = relationship(back_populates="book")


class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    member_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(default=None)
    address: Mapped[str | None] = mapped_column(default=None)
    status: Mapped[str] = mapped_column(String(50), default="active")
    join_date: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    issues: Mapped[list["BookIssue"]] = relationship(back_populates="member")
    fines: Mapped[list["Fine"]] = relationship(back_populates="member")


class BookIssue(Base):
    __tablename__ = "book_issues"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), index=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), index=True)
    issued_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    issue_date: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    due_date: Mapped[datetime | None] = mapped_column(default=None)
    return_date: Mapped[datetime | None] = mapped_column(default=None)
    status: Mapped[str] = mapped_column(String(50), default="issued")
    fine_amount: Mapped[float] = mapped_column(default=0.0)

    book: Mapped[Book] = relationship(back_populates="issues")
    member: Mapped[Member] = relationship(back_populates="issues")
    issued_by_user: Mapped[User | None] = relationship(back_populates="book_issues")


class Fine(Base):
    __tablename__ = "fines"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), index=True)
    amount: Mapped[float] = mapped_column(default=0.0)
    paid: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    member: Mapped[Member] = relationship(back_populates="fines")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), index=True)
    entity_type: Mapped[str] = mapped_column(String(100), default="system")
    details: Mapped[str] = mapped_column(default="")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    user: Mapped[User | None] = relationship(back_populates="activity_logs")
