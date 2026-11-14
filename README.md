# BooksVault

**A considered workspace for library collections, members, and circulation.**

BooksVault is a full-stack Library Management System for organizing a catalog, managing member accounts, and tracking book issues and returns. Its React frontend communicates with a FastAPI backend through a JSON API protected by JWT authentication and role-based access.

## Screenshots

| Landing page | Library overview | Book catalog |
| --- | --- | --- |
| _Screenshot placeholder — add `docs/screenshots/landing.png`_ | _Screenshot placeholder — add `docs/screenshots/dashboard.png`_ | _Screenshot placeholder — add `docs/screenshots/catalog.png`_ |

Replace these placeholders with captured product screenshots before publishing the portfolio.

## Features

- **Authentication and access control:** JWT sign-in with Admin, Librarian, and Member roles.
- **Catalog management:** Create, view, update, and delete books, authors, categories, and publishers.
- **Catalog discovery:** Search, filter, sort, and paginate books by supported catalog fields.
- **Member management:** Maintain member records and view borrowing history.
- **Circulation:** Issue available books and record returns.
- **Dashboard and reports:** Review library statistics, recent issues and returns, popular titles, overdue members, and fines.
- **Operational records:** Review activity logs and fine records.
- **Consistent API responses:** API responses use a `{ "success", "message", "data" }` envelope.
- **Responsive interface:** Reusable forms, tables, dialogs, loading states, and empty states.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS |
| Forms and feedback | React Hook Form, React Hot Toast, Lucide React |
| Backend | FastAPI, Python, Pydantic Settings |
| Data access | SQLAlchemy, MySQL/PyMySQL, SQLite for local development |
| Authentication | JWT (PyJWT), bcrypt password hashing |
| Migrations | Alembic configuration |
| Tests | pytest, HTTPX |

## Architecture

```mermaid
flowchart LR
    Browser["Browser"]
    UI["React + Vite<br/>Pages, components, routes"]
    Client["Axios services<br/>JWT request interceptor"]
    API["FastAPI<br/>API routers"]
    Auth["Dependencies<br/>Authentication and role checks"]
    Schemas["Pydantic schemas"]
    Services["Services"]
    Repositories["Repositories"]
    Models["SQLAlchemy models"]
    DB[("MySQL or SQLite")]

    Browser --> UI --> Client --> API
    API --> Auth
    API --> Schemas
    API --> Services --> Repositories --> Models --> DB
```

The canonical backend entry point is `backend.app.main:app`. The application mounts its routers under `/api`; the root `app/main.py` is a compatibility wrapper.

## Project structure

```text
.
├── backend/
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── alembic.ini
│   └── app/
│       ├── api/
│       │   ├── dependencies.py
│       │   └── routers/
│       │       ├── auth.py
│       │       ├── books.py
│       │       ├── catalog.py
│       │       ├── dashboard.py
│       │       └── members.py
│       ├── core/config.py
│       ├── database/
│       │   ├── base.py
│       │   ├── seed.py
│       │   └── session.py
│       ├── middleware/
│       ├── models/models.py
│       ├── repositories/
│       ├── schemas/schemas.py
│       ├── services/
│       └── main.py
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── utils/
├── tests/
│   ├── test_api.py
│   └── test_library_features.py
├── app/
│   └── main.py                 # Compatibility wrapper
├── requirements.txt
└── README.md
```

## Installation

Prerequisites: Python, Node.js with npm, and optionally MySQL. Without a database URL or the MySQL opt-in setting, the backend uses a local SQLite database.

### Backend

From the repository root, create and activate a virtual environment, then install the Python dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

On macOS or Linux, activate the environment with:

```bash
source .venv/bin/activate
```

### Frontend

```bash
cd frontend
npm install
```

## Environment variables

Backend settings are read from a root `.env` file or the process environment. The settings prefix is `LIBRAFLOW_` for compatibility with existing deployments.

| Variable | Purpose | Default |
| --- | --- | --- |
| `LIBRAFLOW_APP_NAME` | Application name setting | `BooksVault` |
| `LIBRAFLOW_SECRET_KEY` | JWT signing secret | Development-only value; replace it |
| `LIBRAFLOW_ALGORITHM` | JWT signing algorithm | `HS256` |
| `LIBRAFLOW_ACCESS_TOKEN_EXPIRE_DAYS` | Token lifetime in days | `1` |
| `LIBRAFLOW_DATABASE_URL` | SQLAlchemy connection URL | Local SQLite fallback: `sqlite:///./libraflow.db` |
| `LIBRAFLOW_DATABASE_ECHO` | Enable SQLAlchemy SQL logging | `false` |
| `LIBRAFLOW_USE_MYSQL` | Use the configured MySQL default when no database URL is supplied | `false` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:8000/api` |

Example backend `.env` for MySQL:

```dotenv
LIBRAFLOW_APP_NAME=BooksVault
LIBRAFLOW_SECRET_KEY=replace-with-a-long-random-secret
LIBRAFLOW_ALGORITHM=HS256
LIBRAFLOW_ACCESS_TOKEN_EXPIRE_DAYS=1
LIBRAFLOW_DATABASE_URL=mysql+pymysql://user:password@localhost:3306/booksvault?charset=utf8mb4
LIBRAFLOW_DATABASE_ECHO=false
```

For frontend development, create `frontend/.env.local` if the API is not running at its default URL:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

Never use the development signing secret or seeded credentials in a public deployment. URL-encode special characters in database credentials.

## Running locally

Start the backend from the repository root:

```bash
uvicorn backend.app.main:app --reload
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the frontend at [http://localhost:5173](http://localhost:5173). The backend runs at [http://localhost:8000](http://localhost:8000).

On first startup the backend creates tables and seeds the development data. The seed includes a local administrator account (`admin@libraflow.com` / `admin123`); change or remove these credentials before any non-local deployment.

## API documentation

FastAPI publishes interactive API documentation when the backend is running:

- [Swagger UI](http://localhost:8000/docs)
- [ReDoc](http://localhost:8000/redoc)
- [OpenAPI schema](http://localhost:8000/openapi.json)

API endpoints are prefixed with `/api`. Authenticated requests use a bearer token:

```http
Authorization: Bearer <token>
```

| Area | Endpoints |
| --- | --- |
| Authentication and roles | `POST /api/auth/login`, `GET /api/roles`, `GET /api/users`, `POST /api/users`, `PUT /api/users/{user_id}/role` |
| Books and circulation | `GET/POST /api/books`, `GET/PUT/DELETE /api/books/{book_id}`, `POST /api/books/{book_id}/issue`, `POST /api/books/{book_id}/return` |
| Members | `GET/POST /api/members`, `GET/PUT/DELETE /api/members/{member_id}`, `GET /api/members/{member_id}/history` |
| Catalog | `GET/POST /api/authors`, `GET/POST /api/categories`, `GET/POST /api/publishers`; each catalog resource also supports `PUT` and `DELETE` on `/{item_id}` |
| Dashboard and operations | `GET /api/dashboard`, `GET /api/reports`, `GET /api/fines`, `GET /api/activity-logs` |
| Health | `GET /health`, `GET /api/health` |

Successful responses use `{ "success": true, "message": "...", "data": ... }`; errors use the same envelope with `success: false`. Collection endpoints may include pagination metadata.

## Tests and checks

Run the backend test suite from the repository root:

```bash
pytest -q
```

Build the frontend:

```bash
cd frontend
npm run build
```

The frontend package currently provides a production build command but no automated frontend test script.

## Future improvements

- Add and maintain Alembic revision scripts for schema changes.
- Add automated frontend unit and end-to-end tests to CI.
- Replace development seed credentials and default secrets with deployment-time provisioning.
- Configure restrictive CORS origins and production database backups.
- Add real product screenshots and verified user testimonials.
- Publish a license that matches the project's intended reuse.

## License

No license file is currently included. Until a license is added, reuse and redistribution are not granted by this repository.

## Author

**Wajid-901** · [GitHub](https://github.com/Wajid-901)
