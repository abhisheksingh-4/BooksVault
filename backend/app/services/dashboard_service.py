from __future__ import annotations

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.models.models import Book, BookIssue, Fine, Member


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def dashboard(self):
        total_books = self.db.query(Book).count()
        available_books = self.db.query(Book).filter(Book.available_quantity > 0).count()
        issued_books = self.db.query(BookIssue).filter(BookIssue.status == "issued").count()
        returned_books = self.db.query(BookIssue).filter(BookIssue.status == "returned").count()
        active_members = self.db.query(Member).filter(Member.status == "active").count()
        overdue_books = self.db.query(BookIssue).filter(BookIssue.status == "issued", BookIssue.due_date < datetime.utcnow()).count()
        fine_collected = self.db.query(func.coalesce(func.sum(Fine.amount), 0.0)).scalar() or 0.0
        recent_issues = (
            self.db.query(BookIssue)
            .filter(BookIssue.status == "issued")
            .order_by(BookIssue.issue_date.desc())
            .limit(5)
            .all()
        )
        recent_returns = (
            self.db.query(BookIssue)
            .filter(BookIssue.status == "returned")
            .order_by(BookIssue.return_date.desc())
            .limit(5)
            .all()
        )
        top_borrowed = (
            self.db.query(Book, func.count(BookIssue.id).label("borrow_count"))
            .join(BookIssue, BookIssue.book_id == Book.id)
            .group_by(Book.id)
            .order_by(func.count(BookIssue.id).desc(), Book.title.asc())
            .limit(5)
            .all()
        )
        overdue_rows = (
            self.db.query(Member, func.count(BookIssue.id).label("overdue_count"), func.min(BookIssue.due_date).label("oldest_due_date"))
            .join(BookIssue, BookIssue.member_id == Member.id)
            .filter(BookIssue.status == "issued", BookIssue.due_date < datetime.utcnow())
            .group_by(Member.id)
            .order_by(func.min(BookIssue.due_date).asc())
            .all()
        )
        return {
            "total_books": total_books,
            "available_books": available_books,
            "issued_books": issued_books,
            "returned_books": returned_books,
            "active_members": active_members,
            "overdue_books": overdue_books,
            "fine_collected": float(fine_collected),
            "recent_issues": [self._issue_summary(issue) for issue in recent_issues],
            "recent_returns": [self._issue_summary(issue) for issue in recent_returns],
            "top_borrowed_books": [
                {"book_id": book.id, "title": book.title, "borrow_count": count}
                for book, count in top_borrowed
            ],
            "overdue_members": [
                {
                    "member_id": member.id,
                    "name": member.name,
                    "email": member.email,
                    "overdue_count": count,
                    "oldest_due_date": due_date.isoformat() if due_date else None,
                }
                for member, count, due_date in overdue_rows
            ],
        }

    def reports(self):
        total_books = self.db.query(Book).count()
        active_members = self.db.query(Member).filter(Member.status == "active").count()
        total_fines = self.db.query(func.coalesce(func.sum(Fine.amount), 0.0)).scalar() or 0.0
        books_issued = self.db.query(BookIssue).filter(BookIssue.status == "issued").count()
        return {
            "total_books": total_books,
            "active_members": active_members,
            "total_fines": float(total_fines),
            "books_issued": books_issued,
        }

    @staticmethod
    def _issue_summary(issue: BookIssue) -> dict:
        return {
            "issue_id": issue.id,
            "book_id": issue.book_id,
            "book_title": issue.book.title if issue.book else None,
            "member_id": issue.member_id,
            "member_name": issue.member.name if issue.member else None,
            "issue_date": issue.issue_date.isoformat() if issue.issue_date else None,
            "due_date": issue.due_date.isoformat() if issue.due_date else None,
            "return_date": issue.return_date.isoformat() if issue.return_date else None,
        }
