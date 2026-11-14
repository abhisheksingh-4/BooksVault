from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.app.models.models import ActivityLog, Author, Book, BookIssue, Category, Fine, Publisher, User


class BookRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_books(
        self,
        search: str | None = None,
        available_only: bool = False,
        author_id: int | None = None,
        category_id: int | None = None,
        publisher_id: int | None = None,
        title: str | None = None,
        isbn: str | None = None,
        author: str | None = None,
        category: str | None = None,
        publisher: str | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "title",
        sort_order: str = "asc",
    ):
        query = self.db.query(Book)
        if any((search, author, category, publisher)):
            query = query.outerjoin(Book.author).outerjoin(Book.category).outerjoin(Book.publisher)
        if search:
            pattern = f"%{search}%"
            query = query.filter(or_(
                Book.title.ilike(pattern),
                Book.isbn.ilike(pattern),
                Author.name.ilike(pattern),
                Category.name.ilike(pattern),
                Publisher.name.ilike(pattern),
            ))
        if title:
            query = query.filter(Book.title.ilike(f"%{title}%"))
        if isbn:
            query = query.filter(Book.isbn.ilike(f"%{isbn}%"))
        if author:
            query = query.filter(Author.name.ilike(f"%{author}%"))
        if category:
            query = query.filter(Category.name.ilike(f"%{category}%"))
        if publisher:
            query = query.filter(Publisher.name.ilike(f"%{publisher}%"))
        if available_only:
            query = query.filter(Book.available_quantity > 0)
        if author_id is not None:
            query = query.filter(Book.author_id == author_id)
        if category_id is not None:
            query = query.filter(Book.category_id == category_id)
        if publisher_id is not None:
            query = query.filter(Book.publisher_id == publisher_id)
        total = query.distinct().count()
        sort_columns = {
            "title": Book.title,
            "created_at": Book.created_at,
            "available_quantity": Book.available_quantity,
        }
        order_column = sort_columns[sort_by]
        query = query.order_by(order_column.desc() if sort_order == "desc" else order_column.asc(), Book.id.asc())
        books = query.offset((page - 1) * page_size).limit(page_size).all()
        return books, total

    def get_by_id(self, book_id: int) -> Book | None:
        return self.db.get(Book, book_id)

    def get_or_create_entity(self, model, name: str, extra_data: dict | None = None):
        record = self.db.query(model).filter(model.name == name).first()
        if record is None:
            record = model(name=name, **(extra_data or {}))
            self.db.add(record)
            self.db.commit()
            self.db.refresh(record)
        return record

    def create(self, *, isbn: str, title: str, author: Author, publisher: Publisher, category: Category, edition: str | None, language: str | None, quantity: int, rack_number: str | None):
        if self.db.query(Book).filter(Book.isbn == isbn).first():
            raise HTTPException(status_code=409, detail="Book with this ISBN already exists")
        book = Book(
            isbn=isbn,
            title=title,
            edition=edition,
            language=language,
            quantity=quantity,
            available_quantity=quantity,
            rack_number=rack_number,
            author_id=author.id,
            publisher_id=publisher.id,
            category_id=category.id,
        )
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        return book

    def update(self, book: Book, **values):
        if values.get("isbn") is not None:
            existing = self.db.query(Book).filter(Book.isbn == values["isbn"], Book.id != book.id).first()
            if existing:
                raise HTTPException(status_code=409, detail="Book with this ISBN already exists")
        if values.get("isbn") is not None:
            book.isbn = values["isbn"]
        if values.get("title") is not None:
            book.title = values["title"]
        if values.get("edition") is not None:
            book.edition = values["edition"]
        if values.get("language") is not None:
            book.language = values["language"]
        if values.get("rack_number") is not None:
            book.rack_number = values["rack_number"]
        if values.get("quantity") is not None:
            new_quantity = values["quantity"]
            active_issues = self.db.query(BookIssue).filter(BookIssue.book_id == book.id, BookIssue.status == "issued").count()
            if new_quantity < active_issues:
                raise HTTPException(status_code=409, detail="Quantity cannot be lower than the number of books currently issued")
            book.quantity = new_quantity
            book.available_quantity = new_quantity - active_issues
        if values.get("author") is not None:
            book.author = values["author"]
        if values.get("publisher") is not None:
            book.publisher = values["publisher"]
        if values.get("category") is not None:
            book.category = values["category"]
        self.db.commit()
        return book

    def delete(self, book: Book) -> None:
        if self.db.query(BookIssue).filter(BookIssue.book_id == book.id, BookIssue.status == "issued").count():
            raise HTTPException(status_code=409, detail="Cannot delete a book with active issues")
        self.db.delete(book)
        self.db.commit()

    def add_activity(self, user_id: int | None, action: str, entity_type: str, details: str) -> None:
        self.db.add(ActivityLog(user_id=user_id, action=action, entity_type=entity_type, details=details))
        self.db.commit()

    def issue_book(self, *, book: Book, member_id: int, issued_by_id: int, due_days: int):
        if book.available_quantity <= 0:
            raise HTTPException(status_code=400, detail="Book is not available for issue")
        issue = BookIssue(
            book_id=book.id,
            member_id=member_id,
            issued_by_id=issued_by_id,
            issue_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=due_days),
            status="issued",
        )
        self.db.add(issue)
        book.available_quantity -= 1
        self.db.commit()
        self.db.refresh(issue)
        return issue

    def return_book(self, *, book: Book, member_id: int, current_user: User):
        issue = (
            self.db.query(BookIssue)
            .filter(BookIssue.book_id == book.id, BookIssue.member_id == member_id, BookIssue.status == "issued")
            .order_by(BookIssue.issue_date.desc())
            .first()
        )
        if not issue:
            raise HTTPException(status_code=404, detail="Open issue record not found")

        issue.status = "returned"
        issue.return_date = datetime.utcnow()
        issue.fine_amount = 0.0
        if issue.due_date and issue.return_date > issue.due_date:
            overdue_days = (issue.return_date - issue.due_date).days + 1
            issue.fine_amount = overdue_days * 10
            self.db.add(Fine(member_id=member_id, amount=issue.fine_amount, paid=True))
        book.available_quantity += 1
        self.db.commit()
        return issue
