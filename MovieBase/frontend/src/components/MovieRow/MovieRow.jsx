import { useRef } from "react";
import "./MovieRow.css";
import MovieCard from "../MovieCard/MovieCard";

function MovieRow({ title, movies }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="movie-row">
      <h2>{title}</h2>
      <div className="movie-row-wrapper">
        <button className="row-arrow row-arrow-left" onClick={() => scroll("left")}>‹</button>
        <div className="movie-container" ref={scrollRef}>
          {movies.map((movie) => (
            <MovieCard key={`${movie.movie_id ?? movie.id}-${(movie.title || '').slice(0, 20).replace(/\s+/g, '_')}`} movie={movie} />
          ))}
        </div>
        <button className="row-arrow row-arrow-right" onClick={() => scroll("right")}>›</button>
      </div>
    </section>
  );
}

export default MovieRow;
