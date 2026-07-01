from fastapi import FastAPI

from app.database.base import Base
from app.database.database import engine

from app.models.movie import Movie
from app.models.genre import Genre

from app.routes.movies import router as movie_router
from app.routes.genres import router as genre_router

app = FastAPI(
    title="IMDb Clone API",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

app.include_router(movie_router)
app.include_router(genre_router)


@app.get("/")
def root():
    return {"message": "IMDb Clone Backend Running 🚀"}