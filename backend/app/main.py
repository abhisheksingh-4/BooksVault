from __future__ import annotations

import json
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.api.routers import auth_router, books_router, catalog_router, dashboard_router, members_router
from backend.app.database.seed import seed_database
from backend.app.database.session import create_database

logger = logging.getLogger(__name__)
app = FastAPI(title="BooksVault API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(books_router, prefix="/api")
app.include_router(catalog_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(members_router, prefix="/api")


@app.middleware("http")
async def standardize_api_responses(request, call_next):
    response = await call_next(request)
    if not (request.url.path == "/" or request.url.path == "/health" or request.url.path.startswith("/api/")):
        return response
    if "application/json" not in response.headers.get("content-type", ""):
        return response
    body = b"".join([chunk async for chunk in response.body_iterator])
    parsed_body = json.loads(body)
    if isinstance(parsed_body, dict) and "success" in parsed_body and "message" in parsed_body and "data" in parsed_body:
        content = parsed_body
    else:
        message = parsed_body.get("message", "Request successful") if isinstance(parsed_body, dict) else "Request successful"
        content = {"success": True, "message": str(message), "data": parsed_body}
    headers = {key: value for key, value in response.headers.items() if key.lower() not in {"content-length", "content-type"}}
    return Response(
        content=json.dumps(content, default=str),
        status_code=response.status_code,
        headers=headers,
        media_type="application/json",
        background=response.background,
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc: StarletteHTTPException):
    detail = exc.detail
    message = detail if isinstance(detail, str) else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={"success": False, "message": message, "data": detail if not isinstance(detail, str) else None},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = [
        {"location": error["loc"], "message": error["msg"], "type": error["type"]}
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Request validation failed", "data": errors},
    )


@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={
            "success": False,
            "message": "A record with the supplied unique value or relationship already exists",
            "data": None,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    logger.exception("Unhandled API error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error", "data": None},
    )


@app.get("/")
def root() -> dict:
    return {"message": "Welcome to BooksVault API"}


@app.get("/health")
@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "BooksVault"}


create_database()
seed_database()

__all__ = ["app"]
