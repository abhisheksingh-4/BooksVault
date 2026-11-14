"""Compatibility wrapper for the legacy app entrypoint.

The canonical application entrypoint is backend.app.main.
"""

from backend.app.main import app

__all__ = ["app"]
