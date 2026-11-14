from __future__ import annotations

from sqlalchemy.orm import Session

from backend.app.database.session import SessionLocal
from backend.app.models.models import ActivityLog, Author, Book, Category, Member, Publisher, Role, User
from backend.app.services.auth_service import AuthService


def get_or_create_entity(db: Session, model, name: str, extra_data: dict | None = None):
    record = db.query(model).filter(model.name == name).first()
    if record is None:
        record = model(name=name, **(extra_data or {}))
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


def seed_database() -> None:
    db = SessionLocal()
    try:
        for role_name in ("admin", "librarian", "member"):
            if db.get(Role, role_name) is None:
                db.add(Role(name=role_name))
        db.commit()

        if not db.query(User).first():
            admin = User(
                full_name="System Administrator",
                email="admin@libraflow.com",
                password_hash=AuthService.hash_password("admin123"),
                role="admin",
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            db.add(ActivityLog(user_id=admin.id, action="created", entity_type="system", details="Default admin user initialized"))
            db.commit()

        if db.query(Book).count() == 0:
            author = get_or_create_entity(db, Author, "George Orwell")
            publisher = get_or_create_entity(db, Publisher, "Penguin Books")
            category = get_or_create_entity(db, Category, "Classic")
            book = Book(
                isbn="978-0141036144",
                title="1984",
                edition="1st",
                language="English",
                quantity=3,
                available_quantity=3,
                rack_number="A-1",
                author_id=author.id,
                publisher_id=publisher.id,
                category_id=category.id,
            )
            db.add(book)

            author2 = get_or_create_entity(db, Author, "Aldous Huxley")
            publisher2 = get_or_create_entity(db, Publisher, "Harper Perennial")
            category2 = get_or_create_entity(db, Category, "Fiction")
            book2 = Book(
                isbn="978-0060850524",
                title="Brave New World",
                edition="2nd",
                language="English",
                quantity=2,
                available_quantity=2,
                rack_number="A-2",
                author_id=author2.id,
                publisher_id=publisher2.id,
                category_id=category2.id,
            )
            db.add(book2)
            db.commit()

        if db.query(Member).count() == 0:
            member = Member(
                member_id="MEM-001",
                name="Sample Member",
                email="member@example.com",
                phone="9876543210",
                address="City Center",
                status="active",
            )
            db.add(member)
            db.commit()
    finally:
        db.close()
