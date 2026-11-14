# BooksVault

### A considered workspace for library collections, members, and circulation.

BooksVault is a full-stack Library Management System designed to simplify library operations through a modern, responsive web interface. It helps administrators and librarians manage books, members, catalog information, book circulation, and library activities from one centralized platform.

Built with **React 19, Vite, FastAPI, and SQLAlchemy**, BooksVault uses a RESTful JSON API with JWT authentication and role-based access control.

## Live Deployment

| Component | Technology | Deployment |
|---|---|---|
| Frontend | React + Vite | Railway |
| Backend | FastAPI + Python | Railway |
| Database | MySQL / SQLite | Configured through backend environment |

- **Frontend:** https://incredible-manifestation-production-780e8fc6.up.railway.app/
- **Backend API:** booksvault-production.up.railway.app
- **API Documentation:** https://booksvault-production.up.railway.app/docs

## Key Features

### 1. Authentication and Authorization
- Secure user authentication using JWT.
- Role-based access control.
- Supports Admin, Librarian, and Member roles.
- Protected API endpoints.
- Password hashing using bcrypt.

### 2. Book and Catalog Management
- Add, view, update, and delete books.
- Manage authors, categories, and publishers.
- Search books using supported catalog fields.
- Filter, sort, and paginate book records.
- Track available book information.

### 3. Member Management
- Register and manage library members.
- Maintain member information.
- View individual borrowing history.
- Manage member-related records.

### 4. Book Circulation
- Issue available books to members.
- Record book returns.
- Track circulation activities.
- Maintain borrowing records.

### 5. Dashboard and Reports
- View overall library statistics.
- Monitor recent book issues and returns.
- Identify popular books.
- Review overdue members and fines.
- Access library activity information.

### 6. Operational Management
- Maintain fine records.
- Review activity logs.
- Monitor library operations.
- Maintain consistent API response structures.

### 7. Responsive User Interface
- Modern React-based interface.
- Reusable components.
- Responsive layouts.
- Interactive forms and dialogs.
- Loading indicators and empty states.
- User notifications using React Hot Toast.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite 7 |
| Routing | React Router |
| API Communication | Axios |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | FastAPI, Python |
| Validation | Pydantic |
| ORM | SQLAlchemy |
| Database | MySQL, SQLite |
| Authentication | JWT, PyJWT |
| Password Security | bcrypt |
| Database Migrations | Alembic |
| Testing | pytest, HTTPX |
| Deployment | Railway |

## System Architecture

BooksVault follows a client-server architecture. The React frontend communicates with the FastAPI backend through REST API endpoints using Axios.

```mermaid
flowchart TD
    A[User / Browser]
    B[React + Vite Frontend]
    C[Axios API Client]
    D[FastAPI Backend]
    E[JWT Authentication]
    F[API Routers]
    G[Services and Repositories]
    H[SQLAlchemy ORM]
    I[(MySQL / SQLite)]

    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    F --> G
    G --> H
    H --> I
    I --> H
    H --> G
    G --> D
    D --> C
    C --> B
```

### Application Workflow

1. Users access the application through a web browser.
2. The React frontend displays the application interface.
3. Axios sends HTTP requests to the FastAPI backend.
4. The backend validates requests and checks authentication permissions.
5. Services and repositories process business logic and database operations.
6. SQLAlchemy communicates with the configured database.
7. The backend returns structured JSON responses.
8. The frontend displays the returned information.

### Deployment Architecture

The frontend and backend are deployed as separate services on Railway.

- **Frontend service:** React + Vite production application.
- **Backend service:** FastAPI application.
- **Communication:** HTTPS-based API requests.
- **Authentication:** JWT bearer tokens.
- **API base path:** `/api`.

The frontend uses the `VITE_API_URL` environment variable to identify the deployed backend API.

## Project Structure

```text
BooksVault/
│
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
│       ├── core/
│       │   └── config.py
│       ├── database/
│       │   ├── base.py
│       │   ├── seed.py
│       │   └── session.py
│       ├── middleware/
│       ├── models/
│       │   └── models.py
│       ├── repositories/
│       ├── schemas/
│       │   └── schemas.py
│       ├── services/
│       └── main.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── tests/
│   ├── test_api.py
│   └── test_library_features.py
│
├── app/
│   └── main.py
│
├── requirements.txt
└── README.md
```

## Installation and Setup

### Prerequisites

- Python 3.10 or later (compatible with your dependencies).
- Node.js and npm.
- Git.
- MySQL (optional; SQLite can be used for local development).

### 1. Clone the Repository

```bash
git clone https://github.com/abhisheksingh-4/BooksVault.git

cd BooksVault
```

### 2. Backend Setup

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### 3. Backend Environment Configuration

Create a `.env` file in the repository root.

Example:

```dotenv
LIBRAFLOW_APP_NAME=BooksVault
LIBRAFLOW_SECRET_KEY=replace-with-a-secure-random-secret
LIBRAFLOW_ALGORITHM=HS256
LIBRAFLOW_ACCESS_TOKEN_EXPIRE_DAYS=1

LIBRAFLOW_DATABASE_URL=sqlite:///./libraflow.db

LIBRAFLOW_DATABASE_ECHO=false
LIBRAFLOW_USE_MYSQL=false
```

For MySQL, configure:

```dotenv
LIBRAFLOW_DATABASE_URL=mysql+pymysql://user:password@localhost:3306/booksvault?charset=utf8mb4
```

Use secure production credentials and never commit secret environment files to GitHub.

### 4. Start the Backend

From the repository root:

```bash
uvicorn backend.app.main:app --reload
```

Backend local URL:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Create a `.env.local` file inside the frontend folder:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

Start the development server:

```bash
npm run dev
```

Frontend local URL:

```text
http://localhost:5173
```

## API Configuration

The frontend communicates with the backend using Axios.

The API base URL is configured through:

```javascript
const baseURL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api"
).replace(/\/+$/, "");
```

For local development:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

For Railway production:

```dotenv
VITE_API_URL=https://booksvault-production.up.railway.app/api
```

Configure the production value in:

**Railway → Frontend Service → Variables**

Vite environment variables are included during the frontend build, so redeploy after changing them.

## Railway Deployment

### Frontend Deployment

The React frontend is deployed as a separate Railway service.

| Setting | Value |
|---|---|
| Root Directory | `/frontend` |
| Builder | Railpack |
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Production Output | `dist` |

The frontend production start script:

```json
"start": "serve -s dist -l $PORT"
```

Install the production server:

```bash
npm install serve
```

### Frontend Environment Variable

```dotenv
VITE_API_URL=https://booksvault-production.up.railway.app/api
```

### Backend Deployment

The backend is deployed separately using FastAPI.

Canonical application entry point:

```text
backend.app.main:app
```

Example start command:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

Configure backend environment variables, database connectivity, and CORS in Railway.

### CORS Configuration

Allow your actual deployed frontend domain in the FastAPI backend.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://YOUR-FRONTEND-DOMAIN"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Replace the example domain with the actual Railway frontend domain.

## API Endpoints

All application API endpoints are mounted under `/api`.

| Module | Endpoint | Description |
|---|---|---|
| Authentication | `POST /api/auth/login` | User login |
| Roles | `GET /api/roles` | Retrieve roles |
| Users | `GET /api/users` | Retrieve users |
| Users | `POST /api/users` | Create users |
| Users | `PUT /api/users/{user_id}/role` | Update user role |
| Books | `GET /api/books` | Retrieve books |
| Books | `POST /api/books` | Add a book |
| Books | `GET /api/books/{book_id}` | Retrieve book details |
| Books | `PUT /api/books/{book_id}` | Update book |
| Books | `DELETE /api/books/{book_id}` | Delete book |
| Circulation | `POST /api/books/{book_id}/issue` | Issue a book |
| Circulation | `POST /api/books/{book_id}/return` | Return a book |
| Members | `/api/members` | Manage members |
| Catalog | `/api/authors` | Manage authors |
| Catalog | `/api/categories` | Manage categories |
| Catalog | `/api/publishers` | Manage publishers |
| Dashboard | `GET /api/dashboard` | Dashboard information |
| Reports | `GET /api/reports` | Library reports |
| Fines | `GET /api/fines` | Fine records |
| Activity | `GET /api/activity-logs` | Activity history |

### API Documentation

- Swagger UI: https://booksvault-production.up.railway.app/docs
- ReDoc: https://booksvault-production.up.railway.app/redoc
- OpenAPI JSON: https://booksvault-production.up.railway.app/openapi.json

## Authentication and Security

BooksVault uses JWT-based authentication.

- Users authenticate through the login endpoint.
- The backend generates a JWT access token.
- The frontend stores the token in session storage.
- Axios attaches the token to authenticated requests.
- The backend validates the token and checks user permissions.
- Role-based access control restricts protected operations.

Authenticated request example:

```http
Authorization: Bearer <your-access-token>
```

Security considerations:

- Use a strong, unique JWT signing secret.
- Never expose backend secrets in frontend variables.
- Configure HTTPS for production.
- Restrict CORS to trusted frontend domains.
- Do not use development credentials in production.
- Protect database credentials and environment files.

## Testing and Build Verification

### Backend Tests

```bash
pytest -q
```

### Frontend Production Build

```bash
cd frontend
npm run build
```

The production files are generated in the `dist` directory.

The current frontend package does not include a dedicated automated frontend test script.

## Advantages

1. Centralized management of books, members, and circulation.
2. Improved efficiency by reducing manual library record management.
3. Role-based security for administrators, librarians, and members.
4. Quick catalog discovery through search and filtering.
5. Structured communication between frontend and backend.
6. Scalable architecture with separate frontend and backend services.
7. Responsive design for different screen sizes.
8. Maintainable code through modular backend architecture and reusable frontend components.

## Limitations

1. Requires an internet connection for accessing the deployed application.
2. Backend availability depends on the hosting platform.
3. Performance depends on server and database resources.
4. JWT security requires proper token management.
5. Further automated frontend testing is needed.
6. Advanced library integrations and external catalog synchronization are not currently included.

## Future Enhancements

- Add automated frontend unit and end-to-end testing.
- Introduce email notifications for due dates and overdue books.
- Implement barcode or QR-code scanning.
- Add advanced analytics and graphical reports.
- Introduce automated fine calculation.
- Improve library search with advanced filtering.
- Add database backup and recovery mechanisms.
- Maintain Alembic migration revision scripts.
- Improve accessibility and multilingual support.

## Project Information

**Project Name:** BooksVault  
**Project Type:** Full-Stack Web Application  
**Domain:** Library Management System  
**Frontend:** React + Vite  
**Backend:** FastAPI + Python  
**Database:** MySQL / SQLite  
**Deployment:** Railway  

**GitHub Repository:**  
https://github.com/abhisheksingh-4/BooksVault

**Author:** Abhishek Singh

## License

No license file is currently included in this repository. Until a license is added, reuse and redistribution are not granted by the repository.
