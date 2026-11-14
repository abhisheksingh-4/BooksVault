import os

os.environ.setdefault("LIBRAFLOW_DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("LIBRAFLOW_USE_MYSQL", "false")
