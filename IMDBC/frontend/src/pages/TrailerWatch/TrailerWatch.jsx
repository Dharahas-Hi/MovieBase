import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchMovieById, fetchMovieVideos } from "../../services/api";
import { formatLongDate } from "../../utils/date";
import "./TrailerWatch.css";

function getYoutubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.substring(1).split("?")[0];
    if (u.pathname.includes("/embed/")) return u.pathname.split("/embed/")[1]?.split("?")[0] || null;
    return u.searchParams.get("v");
  } catch { return null; }
}

function TrailerWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trailer, setTrailer] = useState(null);
  const [youtubeId, setYoutubeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: movie } = await fetchMovieById(id);

        // Try to get trailer URL from movie data
        let trailerUrl = movie.trailer_url;

        // If no trailer URL, try fetching videos
        if (!trailerUrl) {
          try {
            const { data: videos } = await fetchMovieVideos(id);
            const trailerVideo = videos.find(
              (v) => v.type === "Trailer" && v.site === "YouTube"
            ) || videos.find((v) => v.site === "YouTube");
            if (trailerVideo) {
              trailerUrl = `https://www.youtube.com/watch?v=${trailerVideo.key}`;
            }
          } catch {}
        }

        setTrailer(movie);
        if (trailerUrl) {
          const ytId = getYoutubeId(trailerUrl);
          setYoutubeId(ytId);
        }
      } catch {
        setTrailer(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Auto-hide loader after 3s
  useEffect(() => {
    const timer = setTimeout(() => setPlayerReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="trailer-watch-page">
        <div className="loading-screen">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (!trailer) {
    return (
      <div className="trailer-watch-page">
        <div className="trailer-error">
          <div className="trailer-error-icon">🎬</div>
          <h2>Movie Not Found</h2>
          <p>The movie you're looking for doesn't exist or may have been removed.</p>
          <Link to="/upcoming" className="trailer-back-btn">← Back to Upcoming</Link>
        </div>
      </div>
    );
  }

  // Adult content is not viewable directly in this experience.
  if (trailer.adult) {
    return (
      <div className="trailer-watch-page">
        <div className="trailer-error">
          <div className="trailer-error-icon">🔞</div>
          <h2>Content Restricted</h2>
          <p>
            This title contains 18+ adult content and isn't available to view
            in this experience.
          </p>
          <Link to="/upcoming" className="trailer-back-btn">
            ← Back to Upcoming
          </Link>
        </div>
      </div>
    );
  }

  const poster = trailer.poster_url || "";
  const releaseDate = formatLongDate(trailer.release_date);

  return (
    <div className="trailer-watch-page">
      {/* ─── Video Section ─── */}
      <div className="trailer-video-section">
        <div className={`trailer-loader ${playerReady ? "loaded" : ""}`}>
          <div className="loader-ring"></div>
        </div>

        {youtubeId ? (
          <iframe
            className={`trailer-player ${playerReady ? "loaded" : ""}`}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={trailer.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setPlayerReady(true)}
          />
        ) : (
          <div className="trailer-no-video">
            <span className="trailer-no-video-icon">🎬</span>
            <p>No trailer available to play</p>
          </div>
        )}

        {/* Back button */}
        <button className="trailer-back-overlay" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* ─── Info Section ─── */}
      <div className="trailer-info-section">
        <div className="trailer-info-container">
          {/* Poster + Details */}
          <div className="trailer-info-layout">
            {poster && (
              <div className="trailer-poster-wrap">
                <img
                  className="trailer-poster"
                  src={poster}
                  alt={trailer.title}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            )}

            <div className="trailer-details">
              <h1 className="trailer-title">{trailer.title}</h1>

              {/* Meta Row */}
              <div className="trailer-dates-row">
                {releaseDate && (
                  <div className="trailer-date-block">
                    <span className="trailer-date-label">Release Date</span>
                    <span className="trailer-date-value">{releaseDate}</span>
                  </div>
                )}
                {trailer.imdb_rating > 0 && (
                  <div className="trailer-date-block">
                    <span className="trailer-date-label">Rating</span>
                    <span className="trailer-date-value">⭐ {trailer.imdb_rating.toFixed(1)}</span>
                  </div>
                )}
                {trailer.language && (
                  <div className="trailer-date-block">
                    <span className="trailer-date-label">Language</span>
                    <span className="trailer-date-value">{trailer.language}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {trailer.description && (
                <p className="trailer-description">{trailer.description}</p>
              )}

              {/* Action Buttons */}
              <div className="trailer-actions">
                <Link to={`/movie/${id}`} className="trailer-action-btn primary">
                  ← View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrailerWatch;
