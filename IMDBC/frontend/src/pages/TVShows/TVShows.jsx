import { useEffect, useState } from "react";
import { fetchTVShowsPage } from "../../services/api";
import MovieCard from "../../components/MovieCard/MovieCard";
import "./TVShows.css";

function TVShows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchTVShowsPage(1, 40);
        setShows(data.movies || []);
        setTotalPages(data.total_pages);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const data = await fetchTVShowsPage(nextPage, 40);
      setShows((prev) => [...prev, ...(data.movies || [])]);
      setPage(nextPage);
    } catch {}
  };

  return (
    <div className="tvshows-page">
      <div className="tvshows-header">
        <h1>📺 TV Shows</h1>
        <p className="tvshows-subtitle">Explore popular TV series and shows.</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <div className="tvshows-count">{shows.length} shows</div>
          <div className="tvshows-grid">
            {shows.map((show) => (
              <MovieCard key={`tv-${show.movie_id ?? show.id}`} movie={show} />
            ))}
          </div>
          {page < totalPages && (
            <div className="movies-load-more">
              <button className="retry-btn" onClick={loadMore}>
                Load More Shows
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TVShows;
