import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMovieById, fetchMovieCast, fetchMovieReviews, fetchMovieImages, fetchMovieRecommendations } from "../../services/api";
import { getYear, isToday, formatLongDate } from "../../utils/date";
import "./MovieDetails.css";

import TrailerModal from "../../components/TrailerModal/TrailerModal";
import CastCard from "../../components/CastCard/CastCard";
import MovieReviews from "../../components/MovieReviews/MovieReviews";
import MovieGallery from "../../components/MovieGallery/MovieGallery";
import MovieCard from "../../components/MovieCard/MovieCard";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80";

const PLATFORM_COLORS = {
  "netflix": "#e50914",
  "amazon prime": "#00a8e1",
  "prime video": "#00a8e1",
  "disney+": "#113ccf",
  "disney plus": "#113ccf",
  "hbo": "#9b59b6",
  "hbo max": "#5822b4",
  "paramount+": "#0064ff",
  "apple tv": "#555555",
  "hotstar": "#1aa0e2",
  "zee5": "#ff5722",
  "sony liv": "#1e1e2f",
  "jiocinema": "#e53935",
  "youtube": "#ff0000",
  "google play": "#3bccff",
};

function getPlatformColor(name) {
  const key = Object.keys(PLATFORM_COLORS).find(
    (k) => name?.toLowerCase().includes(k)
  );
  return key ? PLATFORM_COLORS[key] : "#f5c518";
}

function getPlatformLogo(name) {
  const first = name?.[0]?.toUpperCase() || "W";
  return first;
}

function MovieDetails() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [cast, setCast] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") setShowTrailer(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showTrailer ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showTrailer]);

  const loadExtras = useCallback(async (movieId) => {
    // Use allSettled so one failing API doesn't block the others
    const results = await Promise.allSettled([
      fetchMovieCast(movieId),
      fetchMovieReviews(movieId),
      fetchMovieImages(movieId),
      fetchMovieRecommendations(movieId),
    ]);

    const [castRes, reviewsRes, imagesRes, recRes] = results;

    if (castRes.status === "fulfilled") setCast(castRes.value.data || []);
    else console.error("Failed to load cast:", castRes.reason);

    if (reviewsRes.status === "fulfilled") setReviews(reviewsRes.value.data || []);
    else console.error("Failed to load reviews:", reviewsRes.reason);

    if (imagesRes.status === "fulfilled") setImages(imagesRes.value.data || []);
    else console.error("Failed to load images:", imagesRes.reason);

    if (recRes.status === "fulfilled") setRecommendations(recRes.value.data || []);
    else console.error("Failed to load recommendations:", recRes.reason);
  }, []);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const { data } = await fetchMovieById(id);
        setMovie(data);
        loadExtras(id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
  }, [id, loadExtras]);

  if (loading) {
    return (
      <div className="details-page">
        {/* Skeleton Banner */}
        <section className="details-banner" style={{ background: "var(--bg-secondary)" }}>
          <div className="banner-gradient" style={{ background: "linear-gradient(to right, rgba(0,0,0,.95) 10%, rgba(0,0,0,.75) 45%, rgba(0,0,0,.55) 70%, rgba(0,0,0,.8) 100%)" }}>
            <div className="details-overlay">
              <div className="poster-section">
                <div style={{ width: 320, height: 480, borderRadius: "var(--radius-lg)", background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
              <div className="details-info" style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                  {[1,2,3].map(i => <div key={i} style={{ width: 70, height: 28, borderRadius: 20, background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />)}
                </div>
                <div style={{ width: "80%", height: 48, borderRadius: 8, background: "var(--bg-elevated)", marginBottom: 16, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.1s" }} />
                <div style={{ width: "40%", height: 24, borderRadius: 6, background: "var(--bg-elevated)", marginBottom: 24, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.2s" }} />
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.15s" }} />
                  <div style={{ width: 150, height: 40, borderRadius: 8, background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.25s" }} />
                </div>
                <div style={{ width: "100%", height: 80, borderRadius: 8, background: "var(--bg-elevated)", marginBottom: 30, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.3s" }} />
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ width: 160, height: 50, borderRadius: 40, background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.35s" }} />
                  <div style={{ width: 160, height: 50, borderRadius: 40, background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Skeleton Content */}
        <div className="details-content">
          {[1,2,3].map(i => (
            <div key={i} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: 35, marginBottom: 30, border: "1px solid var(--border)" }}>
              <div style={{ width: 160, height: 28, borderRadius: 6, background: "var(--bg-elevated)", marginBottom: 20, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
              <div style={{ width: "100%", height: 60, borderRadius: 6, background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
            </div>
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="loading-screen" style={{ flexDirection: 'column', gap: 20 }}>
        <div className="error-icon" style={{ marginBottom: 0 }}>?</div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: 28 }}>Movie Not Found</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center' }}>
          The movie you're looking for doesn't exist or may have been removed.
        </p>
        <Link to="/" className="retry-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Adult content is not viewable directly in this experience.
  if (movie.adult) {
    return (
      <div className="loading-screen" style={{ flexDirection: 'column', gap: 20 }}>
        <div className="error-icon" style={{ marginBottom: 0 }}>🔞</div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: 28 }}>Content Restricted</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 440, textAlign: 'center' }}>
          This title contains 18+ adult content and isn't available to view in
          this experience.
        </p>
        <Link to="/" className="retry-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  const poster = movie.poster_url || movie.poster || FALLBACK_POSTER;
  const backdrop = movie.backdrop_url || movie.backdrop || movie.poster_url || FALLBACK_POSTER;
  const year = getYear(movie.release_date) || "N/A";
  const duration = movie.duration ? `${movie.duration} min` : "N/A";
  const releasingToday =
    movie.is_releasing_today || isToday(movie.release_date);
  // A title releasing today whose main release date is older is a re-release.
  const isReRelease = releasingToday && !isToday(movie.release_date);
  const rating = movie.imdb_rating ? Number(movie.imdb_rating) : null;
  const ratingPercent = rating ? Math.round(rating * 10) : null;
  const genres = movie.genres || [];
  const streaming = movie.streaming_platforms || [];

  // Rating circle color
  const getRatingColor = (val) => {
    if (val >= 8) return "#21d07a";
    if (val >= 6) return "#d2d531";
    return "#db2360";
  };

  const renderStars = () => {
    if (!rating) return null;
    const full = Math.floor(rating / 2);
    const half = rating % 2 >= 1;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="star-display">
        {Array.from({ length: full }, (_, i) => (
          <span key={`full-${i}`} className="star-full">★</span>
        ))}
        {half && <span className="star-half">★</span>}
        {Array.from({ length: empty }, (_, i) => (
          <span key={`empty-${i}`} className="star-empty">☆</span>
        ))}
      </span>
    );
  };

  return (
    <div className="details-page">

      {/* ─── HERO BANNER ─── */}

      <section className="details-banner" style={{ backgroundImage: `url(${backdrop})` }}>
        <div className="banner-gradient">

          <div className="details-overlay">

            <div className="poster-section">
              <img
                className="details-poster"
                src={poster}
                alt={movie.title}
                onError={(e) => { e.target.src = FALLBACK_POSTER; }}
              />
            </div>

            <div className="details-info">

              {/* Genres */}
              {genres.length > 0 && (
                <div className="genre-tags">
                  {genres.map((g) => (
                    <Link key={g.genre_id} to={`/genres/${g.genre_id}`} className="genre-tag">
                      {g.genre_name}
                    </Link>
                  ))}
                </div>
              )}

              <h1>{movie.title}</h1>

              {movie.tagline && (
                <p className="tagline">“{movie.tagline}”</p>
              )}

              <div className="meta">
                {movie.content_rating && (
                  <>
                    <span className="content-rating-badge">{movie.content_rating}</span>
                    <span className="meta-dot">•</span>
                  </>
                )}
                {releasingToday && (
                  <span className="release-today-badge">
                    {isReRelease ? "🔄 Re-releasing Today" : "🎬 Releasing Today"}
                  </span>
                )}
                <span>{year}</span>
                <span className="meta-dot">•</span>
                <span>{duration}</span>
                <span className="meta-dot">•</span>
                <span>{movie.language || "English"}</span>
                <span className="meta-dot">•</span>
                <span>{movie.country || "USA"}</span>
              </div>

              {/* Rating Circle */}
              <div className="hero-rating-row">
                {rating !== null && (
                  <div className="rating-circle-wrap" title={`IMDb ${rating.toFixed(1)}`}>
                    <svg viewBox="0 0 36 36" className="rating-circle">
                      <path
                        className="rating-circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="rating-circle-fill"
                        stroke={getRatingColor(rating)}
                        strokeDasharray={`${ratingPercent}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="rating-circle-text">
                      <span className="rating-circle-value">{ratingPercent}</span>
                      <span className="rating-circle-pct">%</span>
                    </div>
                    <div className="rating-label">IMDbc</div>
                  </div>
                )}

                {/* Stars */}
                {rating !== null && (
                  <div className="hero-stars-wrap">
                    <div className="hero-stars">{renderStars()}</div>
                    <span className="hero-rating-num">{rating.toFixed(1)}/10</span>
                    {movie.votes > 0 && (
                      <span className="hero-votes">{movie.votes.toLocaleString()} votes</span>
                    )}
                  </div>
                )}
              </div>

              <p className="description">
                {movie.description || "No description available."}
              </p>

              <div className="action-buttons">
                {movie.trailer_url && (
                  <button className="watch-btn" onClick={() => setShowTrailer(true)}>
                    ▶ Watch Trailer
                  </button>
                )}
                <button className="watchlist-btn">
                  + Watchlist
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {showTrailer && (
        <TrailerModal movie={movie} onClose={() => setShowTrailer(false)} />
      )}

      {/* ─── CONTENT ─── */}

      <div className="details-content">

        {/* Tagline + Overview */}
        <section className="info-card fade-in" style={{ animationDelay: "0.05s" }}>
          <h2>Overview</h2>
          <p>{movie.description || "No description available."}</p>
        </section>

        {/* Movie Information */}
        <section className="info-card fade-in" style={{ animationDelay: "0.1s" }}>
          <h2>Movie Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <h4>Release Year</h4>
              <span>{year}</span>
            </div>
            <div className="info-item">
              <h4>Release Date</h4>
              <span>{formatLongDate(movie.release_date) || "N/A"}</span>
            </div>
            <div className="info-item">
              <h4>Duration</h4>
              <span>{duration}</span>
            </div>
            <div className="info-item">
              <h4>Language</h4>
              <span>{movie.language || "N/A"}</span>
            </div>
            <div className="info-item">
              <h4>Country</h4>
              <span>{movie.country || "N/A"}</span>
            </div>
            {movie.director && (
              <div className="info-item">
                <h4>Director</h4>
                <span>{movie.director}</span>
              </div>
            )}
            {movie.writers && movie.writers.length > 0 && (
              <div className="info-item info-writers-item">
                <h4>Writers</h4>
                <div className="info-writers-list">
                  {movie.writers.slice(0, 3).map((writer, idx) => (
                    <span key={idx} className="writer-tag">{writer}</span>
                  ))}
                  {movie.writers.length > 3 && (
                    <span className="writer-tag writer-more">+{movie.writers.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
            <div className="info-item">
              <h4>IMDb Rating</h4>
              <span className="info-rating-value">{rating ? `${rating.toFixed(1)} / 10` : "N/A"}</span>
            </div>
            {movie.votes > 0 && (
              <div className="info-item">
                <h4>Votes</h4>
                <span>{movie.votes.toLocaleString()}</span>
              </div>
            )}
            {movie.budget && (
              <div className="info-item">
                <h4>Budget</h4>
                <span>{movie.budget}</span>
              </div>
            )}
            {movie.box_office && (
              <div className="info-item">
                <h4>Box Office</h4>
                <span>{movie.box_office}</span>
              </div>
            )}
            {movie.content_rating && (
              <div className="info-item">
                <h4>Content Rating</h4>
                <span className="content-rating-tag">{movie.content_rating}</span>
              </div>
            )}
            {genres.length > 0 && (
              <div className="info-item info-genres-item">
                <h4>Genres</h4>
                <div className="info-genre-list">
                  {genres.map((g) => (
                    <Link key={g.genre_id} to={`/genres/${g.genre_id}`} className="info-genre-tag">
                      {g.genre_name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Awards */}
        {movie.awards && (
          <section className="awards-section fade-in" style={{ animationDelay: "0.12s" }}>
            <div className="awards-header">
              <span className="awards-trophy">🏆</span>
              <div>
                <h2>Awards & Recognition</h2>
                <p className="awards-text">{movie.awards}</p>
              </div>
            </div>
          </section>
        )}

        {/* Streaming Platforms */}
        {streaming.length > 0 && (
          <section className="streaming-section fade-in" style={{ animationDelay: "0.15s" }}>
            <h2>Where to Watch</h2>
            <div className="streaming-grid">
              {streaming.map((platform, idx) => (
                <a
                  key={idx}
                  href={platform.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="streaming-card"
                >
                  <div
                    className="streaming-badge"
                    style={{ background: getPlatformColor(platform.platform) }}
                  >
                    {getPlatformLogo(platform.platform)}
                  </div>
                  <div className="streaming-info">
                    <strong>{platform.platform}</strong>
                    <span className="streaming-cta">Watch Now →</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        <section className="info-card cast-section fade-in" style={{ animationDelay: "0.2s" }}>
          <h2>Cast</h2>
          {cast.length > 0 ? (
            <div className="cast-scroll">
              {cast.map((member) => (
                <CastCard key={member.cast_id} cast={member} />
              ))}
            </div>
          ) : (
            <p style={{ color: "#888" }}>No cast information available yet.</p>
          )}
        </section>

        {/* Gallery */}
        <div className="fade-in" style={{ animationDelay: "0.25s" }}>
          <MovieGallery images={images} />
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="recommendations-section fade-in" style={{ animationDelay: "0.3s" }}>
            <h2>More Like This</h2>
            <p className="recommendations-subtitle">Recommended movies based on {movie.title}</p>
            <div className="recommendations-scroll">
              {recommendations.map((rec) => (
                <MovieCard key={`${rec.movie_id}-${(rec.title || '').slice(0, 20).replace(/\s+/g, '_')}`} movie={rec} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <div className="fade-in" style={{ animationDelay: "0.35s" }}>
          <MovieReviews
            reviews={reviews}
          />
        </div>

      </div>

    </div>
  );
}

export default MovieDetails;