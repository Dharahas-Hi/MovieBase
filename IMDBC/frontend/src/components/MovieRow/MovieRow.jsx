import "./MovieRow.css";
import MovieCard from "../MovieCard/MovieCard";

function MovieRow({ title, movies }) {
  return (
    <section className="movie-row">
      <h2>{title}</h2>

      <div className="movie-container">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

export default MovieRow;