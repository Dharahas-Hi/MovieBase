from pydantic import BaseModel
from datetime import date
from typing import Optional


class MovieBase(BaseModel):
    title: str
    description: Optional[str] = None
    release_date: Optional[date] = None
    duration: Optional[int] = None
    language: Optional[str] = None
    country: Optional[str] = None
    imdb_rating: Optional[float] = None
    poster_url: Optional[str] = None
    trailer_url: Optional[str] = None


class MovieCreate(MovieBase):
    pass


class MovieUpdate(MovieBase):
    pass


class MovieResponse(MovieBase):
    movie_id: int

    class Config:
        from_attributes = True