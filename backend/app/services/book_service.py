from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.models import Author, Book, Category, Member, Publisher, User
from backend.app.repositories.book_repository import BookRepository


class BookService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = BookRepository(db)

    def list_books(self, **filters):
        return self.repository.list_books(**filters)

    def create_book(self, *, payload, current_user: User):
        author = self.repository.get_or_create_entity(Author, payload.author_name)
        publisher = self.repository.get_or_create_entity(Publisher, payload.publisher_name)
        category = self.repository.get_or_create_entity(Category, payload.category_name)
        book = self.repository.create(
            isbn=payload.isbn,
            title=payload.title,
            author=author,
            publisher=publisher,
            category=category,
            edition=payload.edition,
            language=payload.language,
            quantity=payload.quantity,
            rack_number=payload.rack_number,
        )
        self.repository.add_activity(current_user.id, "created", "book", f"Created book: {book.title}")
        return {
            "id": book.id,
            "isbn": book.isbn,
            "title": book.title,
            "available_quantity": book.available_quantity,
            "author": author.name,
            "publisher": publisher.name,
            "category": category.name,
        }

    def get_book(self, book_id: int):
        book = self.repository.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        return {
            "id": book.id,
            "isbn": book.isbn,
            "title": book.title,
            "edition": book.edition,
            "language": book.language,
            "quantity": book.quantity,
            "available_quantity": book.available_quantity,
            "rack_number": book.rack_number,
            "author": book.author.name if book.author else None,
            "publisher": book.publisher.name if book.publisher else None,
            "category": book.category.name if book.category else None,
        }

    def update_book(self, book_id: int, payload, current_user: User):
        book = self.repository.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        values = payload.model_dump(exclude_unset=True)
        if "author_name" in values:
            values["author"] = self.repository.get_or_create_entity(Author, values.pop("author_name"))
        if "publisher_name" in values:
            values["publisher"] = self.repository.get_or_create_entity(Publisher, values.pop("publisher_name"))
        if "category_name" in values:
            values["category"] = self.repository.get_or_create_entity(Category, values.pop("category_name"))
        self.repository.update(book, **values)
        self.repository.add_activity(current_user.id, "updated", "book", f"Updated book: {book.title}")
        return {"message": "Book updated successfully"}

    def delete_book(self, book_id: int, current_user: User):
        book = self.repository.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        self.repository.delete(book)
        self.repository.add_activity(current_user.id, "deleted", "book", f"Deleted book ID {book_id}")
        return {"message": "Book deleted successfully"}

    def issue_book(self, book_id: int, payload, current_user: User):
        book = self.repository.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        member = self.db.get(Member, payload.member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        issue = self.repository.issue_book(book=book, member_id=member.id, issued_by_id=current_user.id, due_days=payload.due_days)
        self.repository.add_activity(current_user.id, "issued", "book_issue", f"Issued book {book.title} to member {member.name}")
        return {
            "id": issue.id,
            "book_id": book_id,
            "member_id": member.id,
            "status": issue.status,
            "issue_date": issue.issue_date.isoformat(),
            "due_date": issue.due_date.isoformat() if issue.due_date else None,
        }

    def return_book(self, book_id: int, payload, current_user: User):
        book = self.repository.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        issue = self.repository.return_book(book=book, member_id=payload.member_id, current_user=current_user)
        self.repository.add_activity(current_user.id, "returned", "book_issue", f"Returned book {book.title} from member {payload.member_id}")
        return {"status": "returned", "book_id": book_id, "member_id": payload.member_id, "fine_amount": issue.fine_amount}
