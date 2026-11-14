from .auth import router as auth_router
from .books import router as books_router
from .catalog import router as catalog_router
from .dashboard import router as dashboard_router
from .members import router as members_router

__all__ = ["auth_router", "books_router", "catalog_router", "dashboard_router", "members_router"]
