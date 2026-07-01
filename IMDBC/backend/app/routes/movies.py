from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.movie import Movie
from app.schemas.movie import MovieCreate, MovieUpdate, MovieResponse

router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)


#GETT ALL MOVIES

@router.get("/", response_model=list[MovieResponse])
def get_movies(db: Session = Depends(get_db)):
    return db.query(Movie).all()


#BY ID

@router.get("/{movie_id}", response_model=MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.movie_id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    return movie


#POST MOVIE

@router.post("/", response_model=MovieResponse)
def create_movie(movie: MovieCreate, db: Session = Depends(get_db)):
    new_movie = Movie(**movie.model_dump())

    db.add(new_movie)
    db.commit()
    db.refresh(new_movie)

    return new_movie

#PUT MOVIE

@router.put("/{movie_id}", response_model=MovieResponse)
def update_movie(movie_id: int, updated: MovieUpdate, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.movie_id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    for key, value in updated.model_dump().items():
        setattr(movie, key, value)

    db.commit()
    db.refresh(movie)

    return movie

#DELETE MOVIE

@router.delete("/{movie_id}")
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.movie_id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    db.delete(movie)
    db.commit()

    return {"message": "Movie deleted successfully"}
