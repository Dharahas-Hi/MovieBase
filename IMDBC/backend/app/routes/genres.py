from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.genre import Genre
from app.schemas.genre import GenreCreate, GenreResponse

router = APIRouter(
    prefix="/genres",
    tags=["Genres"]
)


@router.get("/", response_model=list[GenreResponse])
def get_genres(db: Session = Depends(get_db)):
    return db.query(Genre).all()


@router.post("/", response_model=GenreResponse)
def create_genre(genre: GenreCreate, db: Session = Depends(get_db)):
    new_genre = Genre(**genre.model_dump())

    db.add(new_genre)
    db.commit()
    db.refresh(new_genre)

    return new_genre