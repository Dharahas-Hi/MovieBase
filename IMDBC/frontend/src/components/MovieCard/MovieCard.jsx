import "./MovieCard.css";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  return (
    <Link
      to={`/movie/${movie.id}`}
      className="movie-link"
    >
      <div className="movie-card">

        <img
          src={movie.poster}
          alt={movie.title}
        />

        <div className="movie-info">

          <h3>{movie.title}</h3>

          <div className="movie-rating">
            ⭐ {movie.rating}
          </div>

          <div className="movie-year">
            {movie.year}
          </div>

        </div>

      </div>
    </Link>
  );
}

export default MovieCard;