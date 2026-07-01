from sqlalchemy import Column, Integer, String, Date, Text, Float
from app.database.base import Base


class Movie(Base):
    __tablename__ = "movies"

    movie_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    release_date = Column(Date)
    duration = Column(Integer)
    language = Column(String(50))
    country = Column(String(50))
    imdb_rating = Column(Float)
    poster_url = Column(Text)
    trailer_url = Column(Text)