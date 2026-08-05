import "./MovieCard.css";
import { Link } from "react-router-dom";
import { getYear, isToday } from "../../utils/date";

// Base-aware fallback poster so it works under the /MovieBase/ subpath on GitHub Pages.
const NO_POSTER = `${import.meta.env.BASE_URL}images/no-poster.svg`;

function MovieCard({ movie }) {
  const poster = movie.poster_url || movie.poster || NO_POSTER;
  const rating = movie.imdb_rating ?? movie.rating ?? null;
  const year = getYear(movie.release_date) || movie.year || "";
  const releasingToday = isToday(movie.release_date);

  const getRatingColor = (val) => {
    if (val >= 8) return "#21d07a";
    if (val >= 6) return "#d2d531";
    return "#db2360";
  };

  return (
    <Link to={`/movie/${movie.movie_id ?? movie.id}`} className="movie-link">
      <div className="movie-card">
        <div className="movie-poster-wrap">
          <img
            loading="lazy"
            src={poster}
            alt={movie.title}
            onError={(e) => {
              e.target.src = NO_POSTER;
            }}
          />
          {releasingToday && (
            <div className="movie-today-badge">📅 Releasing Today</div>
          )}
          {rating !== null && (
            <div className="movie-rating-badge" style={{ background: getRatingColor(rating) }}>
              {rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="movie-info">
          <h3 title={movie.title}>{movie.title}</h3>
          {year && <div className="movie-year">{year}</div>}
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;