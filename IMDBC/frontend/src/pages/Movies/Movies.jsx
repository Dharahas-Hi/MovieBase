import { useEffect, useState } from "react";
import { fetchMoviesPage } from "../../services/api";
import MovieCard from "../../components/MovieCard/MovieCard";
import "./Movies.css";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("rating");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMoviesPage(1, 40, { sort, order });
        setMovies(data.movies || []);
        setTotalPages(data.total_pages);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [sort, order]);

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const data = await fetchMoviesPage(nextPage, 40, { sort, order });
      const newMovies = data.movies || [];
      setMovies((prev) => [...prev, ...newMovies]);
      setPage(nextPage);
    } catch {}
  };

  const handleSortChange = (newSort) => {
    if (newSort === sort) {
      setOrder(order === "desc" ? "asc" : "desc");
    } else {
      setSort(newSort);
      setOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="movies-page">
      <div className="movies-header">
        <h1>🎬 Movies</h1>
        <p className="movies-subtitle">
          Explore popular movies from around the world.
        </p>
        <div className="movies-sort-bar">
          <button
            className={`sort-btn ${sort === "rating" ? "active" : ""}`}
            onClick={() => handleSortChange("rating")}
          >
            ⭐ Rating {sort === "rating" && (order === "desc" ? "↓" : "↑")}
          </button>
          <button
            className={`sort-btn ${sort === "year" ? "active" : ""}`}
            onClick={() => handleSortChange("year")}
          >
            📅 Year {sort === "year" && (order === "desc" ? "↓" : "↑")}
          </button>
          <button
            className={`sort-btn ${sort === "title" ? "active" : ""}`}
            onClick={() => handleSortChange("title")}
          >
            🔤 Title {sort === "title" && (order === "desc" ? "↓" : "↑")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <div className="movies-count">{movies.length} movies</div>
          <div className="movies-grid">
            {movies.map((movie, idx) => (
              <MovieCard
                key={`${movie.movie_id ?? movie.id}-${idx}`}
                movie={movie}
              />
            ))}
          </div>
          {page < totalPages && (
            <div className="movies-load-more">
              <button className="retry-btn" onClick={loadMore}>
                Load More Movies
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Movies;
