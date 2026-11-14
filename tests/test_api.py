from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def response_data(response):
    payload = response.json()
    assert payload["success"] is True
    assert "message" in payload
    return payload["data"]


def test_login_success():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@libraflow.com", "password": "admin123"},
    )
    assert response.status_code == 200
    payload = response_data(response)
    assert payload["user"]["email"] == "admin@libraflow.com"
    assert "token" in payload


def test_dashboard():
    headers = {
        "Authorization": f"Bearer {response_data(client.post('/api/auth/login', json={'email': 'admin@libraflow.com', 'password': 'admin123'}))['token']}"
    }
    response = client.get("/api/dashboard", headers=headers)
    assert response.status_code == 200
    payload = response_data(response)
    assert "total_books" in payload
    assert "available_books" in payload


def test_book_lifecycle():
    auth = client.post(
        "/api/auth/login",
        json={"email": "admin@libraflow.com", "password": "admin123"},
    )
    token = response_data(auth)["token"]
    headers = {"Authorization": f"Bearer {token}"}

    book_response = client.post(
        "/api/books",
        json={
            "isbn": "978-1234567890",
            "title": "Python Fundamentals",
            "author_name": "John Doe",
            "publisher_name": "LibraFlow Press",
            "category_name": "Programming",
            "edition": "1st",
            "language": "English",
            "quantity": 2,
            "rack_number": "A-1",
        },
        headers=headers,
    )
    assert book_response.status_code == 200
    book = response_data(book_response)
    book_id = book["id"]

    member_response = client.post(
        "/api/members",
        json={
            "member_id": "MEM-101",
            "name": "Jane Member",
            "email": "jane@example.com",
            "phone": "1234567890",
            "address": "LibraFlow City",
        },
        headers=headers,
    )
    assert member_response.status_code == 200
    member = response_data(member_response)
    member_id = member["id"]

    issue_response = client.post(
        f"/api/books/{book_id}/issue",
        json={"member_id": member_id, "due_days": 7},
        headers=headers,
    )
    assert issue_response.status_code == 200
    issue_data = response_data(issue_response)
    assert issue_data["book_id"] == book_id
    assert issue_data["member_id"] == member_id

    return_response = client.post(
        f"/api/books/{book_id}/return",
        json={"member_id": member_id},
        headers=headers,
    )
    assert return_response.status_code == 200
    return_data = response_data(return_response)
    assert return_data["status"] == "returned"
