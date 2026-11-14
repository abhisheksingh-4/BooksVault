from datetime import datetime, timedelta
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend.app.database.session import SessionLocal
from backend.app.main import app
from backend.app.models.models import BookIssue

client = TestClient(app)


def data(response, expected_status=200):
    assert response.status_code == expected_status, response.text
    result = response.json()
    assert result["success"] is (200 <= expected_status < 300)
    assert "message" in result and "data" in result
    return result["data"]


def auth_headers(email="admin@libraflow.com", password="admin123"):
    login = data(client.post("/api/auth/login", json={"email": email, "password": password}))
    return {"Authorization": f"Bearer {login['token']}"}


def book_payload(**overrides):
    suffix = uuid4().hex[:8]
    return {
        "isbn": f"ISBN-{suffix}",
        "title": f"Book {suffix}",
        "author_name": f"Author {suffix}",
        "publisher_name": f"Publisher {suffix}",
        "category_name": f"Category {suffix}",
        "quantity": 2,
        **overrides,
    }


def member_payload(**overrides):
    suffix = uuid4().hex[:8]
    return {
        "member_id": f"MEM-{suffix}",
        "name": f"Member {suffix}",
        "email": f"{suffix}@example.com",
        **overrides,
    }


def create_book(headers, **overrides):
    return data(client.post("/api/books", json=book_payload(**overrides), headers=headers))


def create_member(headers, **overrides):
    return data(client.post("/api/members", json=member_payload(**overrides), headers=headers))


@pytest.mark.parametrize(
    ("collection", "payload", "updated"),
    [
        ("authors", {"name": "Author", "bio": "Original"}, {"name": "Changed Author", "bio": "Updated"}),
        ("categories", {"name": "Category"}, {"name": "Changed Category"}),
        ("publishers", {"name": "Publisher", "address": "Original"}, {"name": "Changed Publisher", "address": "Updated"}),
    ],
)
def test_catalog_create_update_delete(collection, payload, updated):
    headers = auth_headers()
    prefix = uuid4().hex[:8]
    payload["name"] += prefix
    updated["name"] += prefix
    created = data(client.post(f"/api/{collection}", json=payload, headers=headers))
    changed = data(client.put(f"/api/{collection}/{created['id']}", json=updated, headers=headers))
    assert changed["name"] == updated["name"]
    assert changed.get("bio", changed.get("address")) == updated.get("bio", updated.get("address"))
    assert data(client.delete(f"/api/{collection}/{created['id']}", headers=headers))["message"]
    assert data(client.get(f"/api/{collection}")) is not None


def test_catalog_cannot_delete_entity_referenced_by_book():
    headers = auth_headers()
    created = create_book(headers)
    categories = data(client.get("/api/categories"))
    category = next(item for item in categories if item["name"] == created["category"])
    response = client.delete(f"/api/categories/{category['id']}", headers=headers)
    assert data(response, 409) is None


def test_book_search_filters_pagination_and_sorting():
    headers = auth_headers()
    first = create_book(headers, title="Search Target A", quantity=5)
    second = create_book(headers, title="Search Target B", quantity=1)
    queries = [
        {"title": "Target A"},
        {"isbn": first["isbn"]},
        {"author": first["author"]},
        {"category": first["category"]},
        {"publisher": first["publisher"]},
        {"search": first["author"]},
    ]
    for query in queries:
        page = data(client.get("/api/books", params=query))
        assert any(book["id"] == first["id"] for book in page["items"])

    filtered = data(client.get("/api/books", params={"category": first["category"], "available_only": "true"}))
    assert all(item["category"] == first["category"] and item["available_quantity"] > 0 for item in filtered["items"])
    page_one = data(client.get("/api/books", params={"title": "Search Target", "page": 1, "page_size": 1, "sort_by": "title"}))
    page_two = data(client.get("/api/books", params={"title": "Search Target", "page": 2, "page_size": 1, "sort_by": "title"}))
    assert page_one["total"] == 2 and page_one["total_pages"] == 2
    assert page_one["items"][0]["id"] != page_two["items"][0]["id"]
    desc = data(client.get("/api/books", params={"title": "Search Target", "sort_by": "available_quantity", "sort_order": "desc"}))
    assert desc["items"][0]["id"] == first["id"]
    recent = data(client.get("/api/books", params={"title": "Search Target", "sort_by": "created_at", "sort_order": "desc"}))
    assert [item["id"] for item in recent["items"]] == [second["id"], first["id"]]
    authors = data(client.get("/api/authors"))
    author = next(item for item in authors if item["name"] == first["author"])
    by_ids = data(client.get("/api/books", params={"author_id": author["id"], "page_size": 1}))
    assert by_ids["page"] == 1
    assert by_ids["page_size"] == 1
    publishers = data(client.get("/api/publishers"))
    publisher = next(item for item in publishers if item["name"] == first["publisher"])
    by_publisher_id = data(client.get("/api/books", params={"publisher_id": publisher["id"]}))
    assert any(item["id"] == first["id"] for item in by_publisher_id["items"])
    categories = data(client.get("/api/categories"))
    category = next(item for item in categories if item["name"] == first["category"])
    by_category_id = data(client.get("/api/books", params={"category_id": category["id"]}))
    assert any(item["id"] == first["id"] for item in by_category_id["items"])
    data(client.put(f"/api/books/{second['id']}", json={"quantity": 0}, headers=headers))
    unavailable = data(client.get("/api/books", params={"title": "Search Target B", "available_only": "true"}))
    assert unavailable["items"] == []
    assert second["id"] != first["id"]


def test_duplicate_isbn_and_member_email_are_rejected():
    headers = auth_headers()
    book = book_payload()
    data(client.post("/api/books", json=book, headers=headers))
    assert data(client.post("/api/books", json=book, headers=headers), 409) is None

    member = member_payload()
    data(client.post("/api/members", json=member, headers=headers))
    assert data(client.post("/api/members", json={**member, "member_id": f"MEM-{uuid4().hex[:8]}"}, headers=headers), 409) is None
    another = create_member(headers)
    original = data(client.get("/api/members", headers=headers))
    member_record = next(item for item in original if item["email"] == member["email"])
    updated = {**member_record, "member_id": member["member_id"]}
    assert data(client.put(f"/api/members/{member_record['id']}", json={**updated, "email": another["email"]}, headers=headers), 409) is None

    first = create_book(headers)
    second = create_book(headers)
    assert data(client.put(f"/api/books/{second['id']}", json={"isbn": first["isbn"]}, headers=headers), 409) is None


def test_active_issue_prevents_book_and_member_deletion():
    headers = auth_headers()
    book = create_book(headers, quantity=1)
    member = create_member(headers)
    data(client.post(f"/api/books/{book['id']}/issue", json={"member_id": member["id"]}, headers=headers))
    assert data(client.delete(f"/api/books/{book['id']}", headers=headers), 409) is None
    assert data(client.delete(f"/api/members/{member['id']}", headers=headers), 409) is None
    assert data(client.put(f"/api/books/{book['id']}", json={"quantity": 0}, headers=headers), 409) is None


def test_dashboard_has_recent_circulation_and_overdue_metrics():
    headers = auth_headers()
    book = create_book(headers, quantity=1)
    member = create_member(headers)
    issue = data(client.post(f"/api/books/{book['id']}/issue", json={"member_id": member["id"]}, headers=headers))
    db = SessionLocal()
    try:
        record = db.get(BookIssue, issue["id"])
        record.due_date = datetime.utcnow() - timedelta(days=2)
        db.commit()
    finally:
        db.close()
    dashboard = data(client.get("/api/dashboard", headers=headers))
    assert dashboard["recent_issues"][0]["issue_id"] == issue["id"]
    assert any(item["book_id"] == book["id"] for item in dashboard["top_borrowed_books"])
    assert any(item["member_id"] == member["id"] for item in dashboard["overdue_members"])
    data(client.post(f"/api/books/{book['id']}/return", json={"member_id": member["id"]}, headers=headers))
    returned = data(client.get("/api/dashboard", headers=headers))
    assert returned["recent_returns"][0]["issue_id"] == issue["id"]


def test_roles_are_assignable_and_member_access_is_scoped():
    admin_headers = auth_headers()
    member = create_member(admin_headers)
    created_user = data(client.post(
        "/api/users",
        json={
            "full_name": "Member User",
            "email": member["email"],
            "password": "secure-password",
            "role": "member",
        },
        headers=admin_headers,
    ))
    assert created_user["role"] == "member"
    roles = data(client.get("/api/roles", headers=admin_headers))
    assert {role["name"] for role in roles} >= {"admin", "librarian", "member"}
    assert data(client.put(f"/api/users/{created_user['id']}/role", json={"role": "librarian"}, headers=admin_headers))["role"] == "librarian"
    librarian_headers = auth_headers(member["email"], "secure-password")
    assert data(client.post("/api/books", json=book_payload(), headers=librarian_headers))["id"] > 0
    assert data(client.put(f"/api/users/{created_user['id']}/role", json={"role": "member"}, headers=admin_headers))["role"] == "member"

    member_headers = auth_headers(member["email"], "secure-password")
    assert data(client.get(f"/api/members/{member['id']}", headers=member_headers))["email"] == member["email"]
    assert data(client.get(f"/api/members/{member['id']}/history", headers=member_headers)) == []
    assert data(client.get("/api/members", headers=member_headers), 403) is None
    assert data(client.get("/api/dashboard", headers=member_headers), 403) is None
    assert data(client.post("/api/books", json=book_payload(), headers=member_headers), 403) is None
    other_member = create_member(admin_headers)
    assert data(client.get(f"/api/members/{other_member['id']}", headers=member_headers), 403) is None


def test_validation_and_not_found_errors_use_standard_response_shape():
    invalid_page = client.get("/api/books", params={"page": 0})
    error = invalid_page.json()
    assert invalid_page.status_code == 422
    assert error["success"] is False
    assert error["message"] == "Request validation failed"
    assert isinstance(error["data"], list)
    not_found = client.get("/api/books/999999")
    error = not_found.json()
    assert not_found.status_code == 404
    assert error["success"] is False
    assert error["message"] == "Book not found"
