import { useEffect, useState, useMemo, useRef } from "react";
import { fetchTrending, fetchNowPlaying, fetchUpcoming, fetchMoviesPage } from "../../services/api";
import Hero from "../../components/Hero/Hero";
import MovieRow from "../../components/MovieRow/MovieRow";

const ROWS_PER_PAGE = 2;

function Home() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [trendRes, topRes, nowRes, upRes, popRes] = await Promise.allSettled([
          fetchTrending("movie", "week"),
          fetchMoviesPage(1, 20, { sort: "rating", order: "desc" }),
          fetchNowPlaying(),
          fetchUpcoming(),
          fetchMoviesPage(1, 20, {}),
        ]);

        // Belt-and-suspenders: never surface adult content on the home page.
        const safeList = (movies) => (movies || []).filter((m) => !m.adult);
        if (trendRes.status === "fulfilled") setTrending(safeList(trendRes.value.movies));
        if (topRes.status === "fulfilled") setTopRated(safeList(topRes.value.movies));
        if (nowRes.status === "fulfilled") setNowPlaying(safeList(nowRes.value.movies));
        if (upRes.status === "fulfilled") setUpcoming(safeList(upRes.value.movies));
        if (popRes.status === "fulfilled") setPopular(safeList(popRes.value.movies));

        // Check if ALL calls failed
        const allFailed = [
          trendRes, topRes, nowRes, upRes, popRes
        ].every(r => r.status === "rejected");

        if (allFailed) {
          setError("Unable to connect to TMDB. Please check your internet connection and try again.");
        }
      } catch (err) {
        console.error("Failed to load movies", err);
        setError("Unable to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const rowKeys = useMemo(() => {
    const keys = [
      { key: "trending", title: "🔥 Trending Now", movies: trending },
      { key: "topRated", title: "⭐ Top Rated", movies: topRated },
      { key: "nowPlaying", title: "🎬 Now Playing", movies: nowPlaying },
      { key: "popular", title: "🌟 Popular", movies: popular },
      { key: "upcoming", title: "📅 Coming Soon", movies: upcoming },
    ];
    return keys.filter((r) => r.movies.length > 0);
  }, [trending, topRated, nowPlaying, upcoming, popular]);

  const totalRowCount = rowKeys.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading || visibleRows >= totalRowCount) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleRows < totalRowCount) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleRows((prev) => Math.min(prev + ROWS_PER_PAGE, totalRowCount));
            setLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, visibleRows, totalRowCount]);

  if (error) {
    return (
      <>
        <Hero />
        <div className="error-state">
          <div className="error-icon">!</div>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Hero />
      {loading ? (
        <div className="loading-container" style={{ height: "40vh" }}>
          <div className="loader"></div>
        </div>
      ) : rowKeys.length === 0 ? (
        <div className="error-state">
          <div className="error-icon">?</div>
          <h2>No Movies Available</h2>
          <p>Unable to fetch movies right now. Please check your internet connection and try again.</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : (
        <>
          {rowKeys.slice(0, visibleRows).map((row) => (
            <MovieRow key={row.key} title={row.title} movies={row.movies} />
          ))}
          <div ref={sentinelRef} style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loadingMore && <div className="loader" style={{ width: 36, height: 36, borderWidth: 3 }}></div>}
            {visibleRows < totalRowCount && !loadingMore && (
              <button
                className="retry-btn"
                onClick={() => setVisibleRows((prev) => Math.min(prev + ROWS_PER_PAGE, totalRowCount))}
                style={{ background: "transparent", border: "1px solid #444", color: "#aaa", padding: "10px 30px" }}
              >
                Load More
              </button>
            )}
            {visibleRows >= totalRowCount && (
              <p style={{ color: "#555", fontSize: 13 }}>You've seen it all! 🎬</p>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Home;
