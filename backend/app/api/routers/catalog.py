from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api.dependencies import require_roles
from backend.app.database.session import get_db
from backend.app.models.models import Author, Book, Category, Publisher
from backend.app.schemas.schemas import CatalogCreate, CatalogUpdate

router = APIRouter(tags=["catalog"])
CATALOG_MODELS = {"authors": Author, "categories": Category, "publishers": Publisher}
CATALOG_SINGULAR = {"authors": "Author", "categories": "Category", "publishers": "Publisher"}


def _serialize(item, kind: str) -> dict:
    data = {"id": item.id, "name": item.name}
    if kind == "authors":
        data["bio"] = item.bio
    elif kind == "publishers":
        data["address"] = item.address
    return data


def _list(kind: str, db: Session):
    model = CATALOG_MODELS[kind]
    return [_serialize(item, kind) for item in db.query(model).order_by(model.name.asc()).all()]


def _create(kind: str, payload: CatalogCreate, db: Session):
    model = CATALOG_MODELS[kind]
    if db.query(model).filter(model.name == payload.name).first():
        raise HTTPException(status_code=409, detail=f"{CATALOG_SINGULAR[kind]} already exists")
    values = {"name": payload.name}
    if kind == "authors":
        values["bio"] = payload.bio
    elif kind == "publishers":
        values["address"] = payload.address
    item = model(**values)
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize(item, kind)


def _update(kind: str, item_id: int, payload: CatalogUpdate, db: Session):
    model = CATALOG_MODELS[kind]
    item = db.get(model, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"{CATALOG_SINGULAR[kind]} not found")
    values = payload.model_dump(exclude_unset=True)
    allowed = {"name"}
    if kind == "authors":
        allowed.add("bio")
    elif kind == "publishers":
        allowed.add("address")
    for field, value in values.items():
        if field in allowed:
            setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return _serialize(item, kind)


def _delete(kind: str, item_id: int, db: Session):
    model = CATALOG_MODELS[kind]
    item = db.get(model, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"{CATALOG_SINGULAR[kind]} not found")
    reference_column = {"authors": Book.author_id, "categories": Book.category_id, "publishers": Book.publisher_id}[kind]
    if db.query(Book).filter(reference_column == item_id).first():
        raise HTTPException(status_code=409, detail=f"Cannot delete a {CATALOG_SINGULAR[kind].lower()} referenced by books")
    db.delete(item)
    db.commit()
    return {"message": f"{CATALOG_SINGULAR[kind]} deleted successfully"}


@router.get("/authors")
def list_authors(db: Session = Depends(get_db)):
    return _list("authors", db)


@router.post("/authors")
def create_author(payload: CatalogCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _create("authors", payload, db)


@router.put("/authors/{item_id}")
def update_author(item_id: int, payload: CatalogUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _update("authors", item_id, payload, db)


@router.delete("/authors/{item_id}")
def delete_author(item_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _delete("authors", item_id, db)


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    return _list("categories", db)


@router.post("/categories")
def create_category(payload: CatalogCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _create("categories", payload, db)


@router.put("/categories/{item_id}")
def update_category(item_id: int, payload: CatalogUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _update("categories", item_id, payload, db)


@router.delete("/categories/{item_id}")
def delete_category(item_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _delete("categories", item_id, db)


@router.get("/publishers")
def list_publishers(db: Session = Depends(get_db)):
    return _list("publishers", db)


@router.post("/publishers")
def create_publisher(payload: CatalogCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _create("publishers", payload, db)


@router.put("/publishers/{item_id}")
def update_publisher(item_id: int, payload: CatalogUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _update("publishers", item_id, payload, db)


@router.delete("/publishers/{item_id}")
def delete_publisher(item_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "librarian"))):
    return _delete("publishers", item_id, db)
