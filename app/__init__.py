"""Compatibility wrapper; use backend.app.main as the canonical app entrypoint."""

from backend.app.main import app

__all__ = ["app"]
