from pydantic import BaseModel


class GenreBase(BaseModel):
    genre_name: str


class GenreCreate(GenreBase):
    pass


class GenreResponse(GenreBase):
    genre_id: int

    class Config:
        from_attributes = True