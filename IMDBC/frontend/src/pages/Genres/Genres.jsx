import { useEffect, useState } from "react";
import { fetchGenres, fetchMoviesByGenre } from "../../services/api";
import MovieCard from "../../components/MovieCard/MovieCard";
import "./Genres.css";

function Genres() {
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGenres = async () => {
      try {
        setLoading(true);
        const { data } = await fetchGenres();
        setGenres(data);
      } catch (err) {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };
    loadGenres();
  }, []);

  const handleGenreSelect = async (genreId) => {
    if (genreId === activeGenre) return;
    setActiveGenre(genreId);
    setMoviesLoading(true);
    try {
      const { data } = await fetchMoviesByGenre(genreId);
      setMovies(data);
    } catch {
      setMovies([]);
    }
    setMoviesLoading(false);
  };

  const activeGenreName = activeGenre
    ? genres.find((g) => g.genre_id === activeGenre)?.genre_name || ""
    : "";

  return (
    <div className="genres-page">
      <div className="genres-header">
        <h1>Genres</h1>
        <p className="genres-subtitle">Select a genre to browse movies.</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-icon">!</div>
          <h2>Connection Error</h2>
          <p>{error}. Please try again later.</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : (
        <>
          <div className="genres-filter-bar">
            {genres.map((genre) => (
              <button
                key={genre.genre_id}
                className={`genre-filter-btn ${activeGenre === genre.genre_id ? "active" : ""}`}
                onClick={() => handleGenreSelect(genre.genre_id)}
              >
                {genre.genre_name}
              </button>
            ))}
          </div>

          <div className="genre-movies-area">
            {activeGenre && (
              <h2>
                {activeGenreName} Movies <span>({movies.length})</span>
              </h2>
            )}

            {moviesLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
              </div>
            ) : movies.length > 0 ? (
              <div className="genre-movies-grid">
                {movies.map((movie) => (
                  <MovieCard key={movie.movie_id ?? movie.id} movie={movie} />
                ))}
              </div>
            ) : activeGenre ? (
              <div className="empty-state">
                <p>No movies found in this genre.</p>
              </div>
            ) : (
              <div className="empty-state">
                <p>Select a genre from above to browse movies.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Genres;
