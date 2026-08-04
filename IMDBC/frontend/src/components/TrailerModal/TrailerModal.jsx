import { useEffect, useState } from "react";
import { getYear } from "../../utils/date";
import "./TrailerModal.css";

function TrailerModal({ movie, onClose }) {
  const [loaded, setLoaded] = useState(false);

  // Auto-hide the loader after 3s even if iframe onLoad doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock page scroll while the modal is open (so the background can't
  // scroll/jank behind the overlay), restoring the previous value on close.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (!movie) return null;

  // Extract YouTube video ID
  let youtubeId = null;
  if (movie.trailer_url) {
    try {
      const url = new URL(movie.trailer_url);
      if (url.hostname.includes("youtu.be")) {
        youtubeId = url.pathname.substring(1).split("?")[0];
      } else if (url.pathname.includes("/embed/")) {
        youtubeId = url.pathname.split("/embed/")[1]?.split("?")[0] || null;
      } else {
        youtubeId = url.searchParams.get("v");
      }
    } catch {
      youtubeId = null;
    }
  }

  const year = getYear(movie.release_date) || "N/A";
  const rating = movie.imdb_rating ? Number(movie.imdb_rating) : null;
  const ratingPercent = rating ? Math.round(rating * 10) : null;
  const genres = movie.genres || [];
  const poster = movie.poster_url || "";

  const getRatingColor = (val) => {
    if (val >= 8) return "#21d07a";
    if (val >= 6) return "#d2d531";
    return "#db2360";
  };

  return (
    <div className="trailer-overlay" onClick={onClose}>
      <div
        className="trailer-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="close-modal" onClick={onClose}>✕</button>

        {/* ─── VIDEO SECTION ─── */}
        {youtubeId ? (
          <div className="video-wrapper">
            <div className={`video-loader ${loaded ? "loaded" : ""}`}>
              <div className="loader-ring"></div>
            </div>
            <iframe
              className={`trailer-video ${loaded ? "loaded" : ""}`}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={movie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoaded(true)}
            />
          </div>
        ) : (
          <div className="video-wrapper">
            <div className="video-placeholder">
              <div className="video-placeholder-icon">🎬</div>
              <h3>No Trailer Available</h3>
              <p>Trailer hasn't been added yet for this movie.</p>
            </div>
          </div>
        )}

        {/* ─── INFO SECTION ─── */}
        <div className="trailer-info">
          <div className="trailer-info-layout">
            {/* Poster Thumbnail */}
            {poster && (
              <div className="trailer-poster-wrap">
                <img
                  className="trailer-poster"
                  src={poster}
                  alt={movie.title}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            )}

            <div className="trailer-details">
              {/* Genre Tags */}
              {genres.length > 0 && (
                <div className="trailer-genre-tags">
                  {genres.map((g) => (
                    <span key={g.genre_id} className="trailer-genre-tag">
                      {g.genre_name}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="trailer-title">{movie.title}</h2>

              {/* Meta Row */}
              <div className="trailer-meta-bar">
                <span className="trailer-year">{year}</span>
                <span className="meta-sep">•</span>
                <span>{movie.language || "English"}</span>
                {movie.duration && (
                  <>
                    <span className="meta-sep">•</span>
                    <span>{movie.duration} min</span>
                  </>
                )}
                {movie.country && (
                  <>
                    <span className="meta-sep">•</span>
                    <span>{movie.country}</span>
                  </>
                )}
              </div>

              {/* Rating Row */}
              <div className="trailer-rating-row">
                {rating !== null && (
                  <div className="trailer-rating-circle-wrap">
                    <svg viewBox="0 0 36 36" className="trailer-rating-circle">
                      <path
                        className="trailer-circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="trailer-circle-fill"
                        stroke={getRatingColor(rating)}
                        strokeDasharray={`${ratingPercent}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="trailer-circle-text">
                      <span className="trailer-circle-value">{ratingPercent}%</span>
                    </div>
                  </div>
                )}
                {rating !== null && (
                  <div className="trailer-stars-wrap">
                    <span className="trailer-stars">
                      {"★".repeat(Math.floor(rating / 2))}
                      {rating % 2 >= 1 ? "★" : ""}
                      {"☆".repeat(5 - Math.floor(rating / 2) - (rating % 2 >= 1 ? 1 : 0))}
                    </span>
                    <span className="trailer-rating-num">{rating.toFixed(1)}/10</span>
                  </div>
                )}
                <div className="trailer-rating-label">IMDb Rating</div>
              </div>

              {/* Director */}
              {movie.director && (
                <div className="trailer-director">
                  <span className="trailer-role-label">Director</span>
                  <span className="trailer-role-value">{movie.director}</span>
                </div>
              )}

              {/* Description */}
              <p className="trailer-description">
                {movie.description || "No description available."}
              </p>

              {/* Action Buttons */}
              <div className="trailer-actions">
                {movie.trailer_url && (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-youtube"
                  >
                    ▶ Watch on YouTube
                  </a>
                )}
                <button className="btn-watchlist">+ Add to Watchlist</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrailerModal;
