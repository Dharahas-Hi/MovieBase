import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMoviesByGenre, fetchGenres } from "../../services/api";
import MovieCard from "../../components/MovieCard/MovieCard";
import "./GenreMovies.css";

function GenreMovies() {
  const { id } = useParams();
  const [movies, setMovies] = useState([]);
  const [genreName, setGenreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Get genre name from genres list
        const { data: genres } = await fetchGenres();
        const genre = genres.find((g) => g.genre_id === Number(id));
        if (genre) setGenreName(genre.genre_name);

        const { data } = await fetchMoviesByGenre(id);
        setMovies(data);
      } catch (err) {
        setError("Failed to load movies for this genre.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="genre-movies-page">
      <div className="genre-movies-header">
        <Link to="/genres" className="back-link">← Back to Genres</Link>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      ) : error ? (
        <p className="genre-movies-error">{error}</p>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          <h2>No Movies Found</h2>
          <p>No movies are available in this genre yet.</p>
        </div>
      ) : (
        <>
          <h1 className="genre-movies-title">
            {genreName || "Genre"} Movies
          </h1>
          <p className="genre-movies-count">{movies.length} movie{movies.length !== 1 ? "s" : ""}</p>

          <div className="genre-movies-grid">
            {movies.map((movie) => (
              <MovieCard key={`${movie.movie_id ?? movie.id}-${(movie.title || '').slice(0, 20).replace(/\s+/g, '_')}`} movie={movie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default GenreMovies;
