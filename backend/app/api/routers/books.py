from math import ceil
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.api.dependencies import require_roles
from backend.app.database.session import get_db
from backend.app.schemas.schemas import BookCreate, BookUpdate, IssueBookRequest, ReturnBookRequest
from backend.app.services.book_service import BookService

router = APIRouter(tags=["books"])


@router.get("/books")
def list_books(
    search: str | None = Query(default=None),
    title: str | None = Query(default=None),
    isbn: str | None = Query(default=None),
    author: str | None = Query(default=None),
    category: str | None = Query(default=None),
    publisher: str | None = Query(default=None),
    available_only: bool = Query(default=False),
    author_id: int | None = Query(default=None),
    category_id: int | None = Query(default=None),
    publisher_id: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["title", "created_at", "available_quantity"] = Query(default="title"),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
):
    books, total = BookService(db).list_books(
        search=search,
        title=title,
        isbn=isbn,
        author=author,
        category=category,
        publisher=publisher,
        available_only=available_only,
        author_id=author_id,
        category_id=category_id,
        publisher_id=publisher_id,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    items = [
        {
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
        for book in books
    ]
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": ceil(total / page_size),
    }


@router.post("/books")
def create_book(payload: BookCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return BookService(db).create_book(payload=payload, current_user=current_user)


@router.get("/books/{book_id}")
def get_book(book_id: int, db: Session = Depends(get_db)):
    return BookService(db).get_book(book_id)


@router.put("/books/{book_id}")
def update_book(book_id: int, payload: BookUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return BookService(db).update_book(book_id, payload, current_user)


@router.delete("/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return BookService(db).delete_book(book_id, current_user)


@router.post("/books/{book_id}/issue")
def issue_book(book_id: int, payload: IssueBookRequest, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return BookService(db).issue_book(book_id, payload, current_user)


@router.post("/books/{book_id}/return")
def return_book(book_id: int, payload: ReturnBookRequest, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return BookService(db).return_book(book_id, payload, current_user)
