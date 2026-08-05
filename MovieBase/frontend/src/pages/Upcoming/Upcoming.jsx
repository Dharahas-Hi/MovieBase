import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { fetchUpcoming, fetchUpcomingTop, fetchNowPlaying } from "../../services/api";
import { parseDate, formatLongDate, formatShortDate } from "../../utils/date";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Upcoming.css";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80";

// Base-aware fallback poster so it works under the /MovieBase/ subpath on GitHub Pages.
const NO_POSTER = `${import.meta.env.BASE_URL}images/no-poster.svg`;

// How many pages (20 movies each) to fetch on first load.
const INITIAL_PAGES = 3;

// ── Region helpers ──
// Detect the user's region from the browser locale, e.g. "en-IN" -> "IN",
// "zh-Hans-CN" -> "CN". Falls back to the US if nothing is found.
function detectRegion() {
  if (typeof navigator === "undefined") return "US";
  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || "en-US"];
  for (const lang of langs) {
    const parts = String(lang).replace(/_/g, "-").split("-");
    for (let i = 1; i < parts.length; i++) {
      if (/^[A-Za-z]{2}$/.test(parts[i])) return parts[i].toUpperCase();
    }
  }
  return "US";
}

function regionNameOf(code) {
  if (!code) return "Worldwide";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

// ── Countdown hook ──
function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!targetDate) return;

    let interval;
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        // Stop ticking once the release moment has passed.
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (interval) clearInterval(interval);
        return;
      }
      setRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    interval = setInterval(tick, 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [targetDate]);

  return remaining;
}

// ── Now Playing Hero (Swiper carousel of films in theaters) ──
function NowPlayingHero({ movies, onOpen, onTrailer }) {
  if (!movies || movies.length === 0) return null;

  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      loop={movies.length > 1}
      pagination={{ clickable: true }}
      navigation
      className="nowplaying-swiper"
    >
      {movies.map((movie) => {
        const mid = movie.movie_id ?? movie.id;
        const bg = movie.backdrop_url || movie.poster_url || FALLBACK_IMG;
        const year = parseDate(movie.release_date)?.getFullYear() || "";
        const rating = movie.imdb_rating > 0 ? movie.imdb_rating : null;

        return (
          <SwiperSlide key={`np-${mid}`}>
            <section
              className="trailer-hero"
              style={{ backgroundImage: `url(${bg})` }}
            >
              <div className="trailer-hero-overlay">
                <div className="trailer-hero-content">
                  <div className="trailer-hero-badge nowplaying-badge">
                    🍿 NOW PLAYING IN THEATERS
                  </div>

                  <h1 className="trailer-hero-title">{movie.title}</h1>

                  <div className="trailer-hero-meta">
                    {year && <span>{year}</span>}
                    <span className="meta-dot">•</span>
                    <span>In Theaters Now</span>
                    {rating && (
                      <>
                        <span className="meta-dot">•</span>
                        <span className="hero-rating">⭐ {rating.toFixed(1)}</span>
                      </>
                    )}
                  </div>

                  {movie.description && (
                    <p className="trailer-hero-desc">
                      {movie.description.length > 200
                        ? movie.description.slice(0, 200) + "..."
                        : movie.description}
                    </p>
                  )}

                  <div className="nowplaying-buttons">
                    <button
                      className="nowplaying-btn primary"
                      onClick={() => onTrailer(movie)}
                    >
                      ▶ Watch Trailer
                    </button>
                    <button
                      className="nowplaying-btn"
                      onClick={() => onOpen(movie)}
                    >
                      More Details
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

// ── Compact "Next Release" countdown strip ──
function NextReleaseCountdown({ movie, onOpen }) {
  const targetDate = useMemo(
    () => parseDate(movie?.release_date),
    [movie?.release_date]
  );
  const remaining = useCountdown(targetDate);

  if (!movie) return null;

  const isReleased =
    remaining &&
    remaining.days === 0 &&
    remaining.hours === 0 &&
    remaining.minutes === 0 &&
    remaining.seconds === 0;

  return (
    <div className="next-release-strip">
      <div className="next-release-info" onClick={() => onOpen && onOpen(movie)}>
        <span className="next-release-label">NEXT BIG RELEASE</span>
        <span className="next-release-title">{movie.title}</span>
        <span className="next-release-date">
          {formatLongDate(movie.release_date)}
        </span>
        <span className="next-release-arrow">View Details →</span>
      </div>
      {!isReleased && remaining && (
        <div className="next-release-countdown">
          {[
            { v: remaining.days, u: "Days" },
            { v: remaining.hours, u: "Hrs" },
            { v: remaining.minutes, u: "Min" },
            { v: remaining.seconds, u: "Sec" },
          ].map((b) => (
            <div className="countdown-block" key={b.u}>
              <span className="countdown-value">
                {String(b.v).padStart(2, "0")}
              </span>
              <span className="countdown-unit">{b.u}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hero Countdown Section (fallback when nothing is in theaters) ──
function HeroCountdown({ movie }) {
  const targetDate = useMemo(
    () => parseDate(movie?.release_date),
    [movie?.release_date]
  );

  const remaining = useCountdown(targetDate);

  if (!movie) return null;

  const backdrop = movie.backdrop_url || movie.poster_url || FALLBACK_IMG;

  const year = parseDate(movie.release_date)?.getFullYear() || "";

  const isReleased =
    remaining &&
    remaining.days === 0 &&
    remaining.hours === 0 &&
    remaining.minutes === 0 &&
    remaining.seconds === 0;

  return (
    <section
      className="trailer-hero"
      style={{ backgroundImage: `url(${backdrop})` }}
    >
      <div className="trailer-hero-overlay">
        <div className="trailer-hero-content">
          <div className="trailer-hero-badge">
            {isReleased ? "📰 NOW PLAYING" : "🔔 UPCOMING RELEASE"}
          </div>

          <h1 className="trailer-hero-title">{movie.title}</h1>

          <div className="trailer-hero-meta">
            {year && <span>{year}</span>}
            <span className="meta-dot">•</span>
            <span>Movie Release</span>
          </div>

          {movie.release_date && (
            <div className="trailer-hero-dates">
              <div className="hero-date-block">
                <span className="hero-date-label">Release Date</span>
                <span className="hero-date-value">
                  {formatLongDate(movie.release_date)}
                </span>
              </div>
            </div>
          )}

          {/* Countdown */}
          {!isReleased && remaining && (
            <div className="countdown-section">
              <p className="countdown-label">Countdown to release</p>
              <div className="countdown-timer">
                <div className="countdown-block">
                  <span className="countdown-value">
                    {String(remaining.days).padStart(2, "0")}
                  </span>
                  <span className="countdown-unit">Days</span>
                </div>
                <span className="countdown-sep">:</span>
                <div className="countdown-block">
                  <span className="countdown-value">
                    {String(remaining.hours).padStart(2, "0")}
                  </span>
                  <span className="countdown-unit">Hours</span>
                </div>
                <span className="countdown-sep">:</span>
                <div className="countdown-block">
                  <span className="countdown-value">
                    {String(remaining.minutes).padStart(2, "0")}
                  </span>
                  <span className="countdown-unit">Min</span>
                </div>
                <span className="countdown-sep">:</span>
                <div className="countdown-block">
                  <span className="countdown-value">
                    {String(remaining.seconds).padStart(2, "0")}
                  </span>
                  <span className="countdown-unit">Sec</span>
                </div>
              </div>
            </div>
          )}

          {isReleased && (
            <div className="countdown-section released-section">
              <div className="released-badge">
                <span className="released-icon">🎉</span>
                <span>Now playing in theaters!</span>
              </div>
            </div>
          )}

          {movie.description && (
            <p className="trailer-hero-desc">
              {movie.description.length > 200
                ? movie.description.slice(0, 200) + "..."
                : movie.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Horizontal card row (Most Anticipated / Now Playing) ──
function TrailerRow({ title, badge, movies, onOpen }) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="recent-trailers-section">
      <div className="recent-trailers-header">
        <h2>{title}</h2>
        {badge && <span className="recent-trailers-badge">{badge}</span>}
      </div>
      <div className="recent-trailers-scroll">
        {movies.map((movie) => {
          const mid = movie.movie_id ?? movie.id;
          const poster = movie.poster_url || NO_POSTER;

          return (
            <div
              key={`${title}-${mid}`}
              className="recent-trailer-card"
              onClick={() => onOpen(movie)}
            >
              <div className="recent-trailer-poster-wrap">
                <img
                  className="recent-trailer-poster"
                  src={poster}
                  alt={movie.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = NO_POSTER;
                  }}
                />
                <div className="recent-trailer-overlay">
                  <span className="recent-play-icon">▶</span>
                </div>
                {movie.release_date && (
                  <span className="recent-trailer-day">
                    {formatShortDate(movie.release_date)}
                  </span>
                )}
              </div>
              <div className="recent-trailer-info">
                <h4 className="recent-trailer-title">{movie.title}</h4>
                {movie.imdb_rating > 0 && (
                  <div className="recent-trailer-dates">
                    <span className="recent-date-label">Rating:</span>
                    <span className="recent-date-value">
                      ⭐ {movie.imdb_rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Main Page ──
function Upcoming() {
  const navigate = useNavigate();
  const detectedRegion = useMemo(() => detectRegion(), []);

  const [region] = useState(detectedRegion);
  const [activeRegion, setActiveRegion] = useState(detectedRegion);
  const [usingGlobal, setUsingGlobal] = useState(false);

  const [upcomingMovies, setUpcoming] = useState([]);
  const [anticipated, setAnticipated] = useState([]);
  const [nowPlayingMovies, setNowPlaying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(INITIAL_PAGES);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // De-duplicate (by id) and sort by release date, nearest first.
  const mergeAndSort = useCallback((list) => {
    const seen = new Set();
    return (list || [])
      .filter((m) => {
        const mid = m.movie_id ?? m.id;
        if (!mid || seen.has(mid)) return false;
        seen.add(mid);
        return true;
      })
      .sort(
        (a, b) =>
          (parseDate(a.release_date)?.getTime() ?? 0) -
          (parseDate(b.release_date)?.getTime() ?? 0)
      );
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1) Upcoming releases for the detected region
        let upcoming = [];
        let total = 1;
        let usedRegion = region;

        const regionResults = await Promise.allSettled(
          Array.from({ length: INITIAL_PAGES }, (_, i) =>
            fetchUpcoming(i + 1, region)
          )
        );
        regionResults.forEach((r) => {
          if (r.status === "fulfilled") {
            upcoming = upcoming.concat(r.value.movies || []);
            total = Math.max(total, r.value.total_pages || 1);
          }
        });

        // 2) No releases found for this region → fall back to the global list
        if (upcoming.length === 0) {
          usedRegion = "";
          const globalResults = await Promise.allSettled(
            Array.from({ length: INITIAL_PAGES }, (_, i) =>
              fetchUpcoming(i + 1, "")
            )
          );
          upcoming = [];
          total = 1;
          globalResults.forEach((r) => {
            if (r.status === "fulfilled") {
              upcoming = upcoming.concat(r.value.movies || []);
              total = Math.max(total, r.value.total_pages || 1);
            }
          });
        }

        setActiveRegion(usedRegion);
        setUsingGlobal(usedRegion === "");
        setTotalPages(total);
        setUpcoming(mergeAndSort(upcoming));
        setPage(INITIAL_PAGES);

        // 3) Most anticipated + now playing (isolated failures)
        const [topRes, nowRes] = await Promise.allSettled([
          fetchUpcomingTop(1, usedRegion || region),
          fetchNowPlaying(),
        ]);
        if (topRes.status === "fulfilled") {
          setAnticipated(topRes.value.movies || []);
        }
        if (nowRes.status === "fulfilled") {
          setNowPlaying(nowRes.value.movies || []);
        }
      } catch (err) {
        console.error("Failed to load", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [region, mergeAndSort]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await fetchUpcoming(next, activeRegion);
      setTotalPages((prev) => Math.max(prev, res.total_pages || 1));
      setUpcoming((prev) => mergeAndSort([...prev, ...(res.movies || [])]));
      setPage(next);
    } catch (err) {
      console.error("Failed to load more", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const featuredMovie = upcomingMovies.length > 0 ? upcomingMovies[0] : null;
  const gridMovies = upcomingMovies.slice(1);
  const gridHasMovies = gridMovies.length > 0 || featuredMovie;
  const hasNowPlaying = nowPlayingMovies.length > 0;

  const openMovie = (movie) => {
    navigate(`/movie/${movie.movie_id ?? movie.id}`);
  };

  const openTrailer = (movie) => {
    navigate(`/trailer/${movie.movie_id ?? movie.id}`);
  };

  if (loading) {
    return (
      <div className="upcoming-page">
        <div className="loading-container" style={{ height: "100vh" }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  const regionLabel = usingGlobal
    ? "Worldwide releases"
    : `Releases in ${regionNameOf(activeRegion || region)}`;

  return (
    <div className="upcoming-page">
      {/* Hero: films playing in theaters now (falls back to the next
          release countdown when nothing is currently in theaters) */}
      {hasNowPlaying ? (
        <NowPlayingHero
          movies={nowPlayingMovies}
          onOpen={openMovie}
          onTrailer={openTrailer}
        />
      ) : (
        featuredMovie && <HeroCountdown movie={featuredMovie} />
      )}

      {hasNowPlaying && featuredMovie && (
        <NextReleaseCountdown movie={featuredMovie} onOpen={openMovie} />
      )}

      <div className="upcoming-header">
        <h1>Upcoming Movies</h1>
        <p className="upcoming-subtitle">
          <span className="region-badge">🌍 {regionLabel}</span>
          &middot; nearest release first
        </p>
      </div>

      {/* Upcoming Grid (region first) */}
      {gridHasMovies ? (
        <>
          <div className="upcoming-count">
            {upcomingMovies.length} upcoming release
            {upcomingMovies.length !== 1 ? "s" : ""} in{" "}
            {usingGlobal ? "theaters worldwide" : regionNameOf(activeRegion || region)}{" "}
            · showing {Math.min(page, totalPages)} of {totalPages} pages
          </div>

          <div className="upcoming-grid">
            {gridMovies.map((movie) => {
              const mid = movie.movie_id ?? movie.id;
              const poster = movie.poster_url || NO_POSTER;
              const releaseDate = parseDate(movie.release_date);
              const isUpcoming =
                releaseDate && releaseDate.getTime() > Date.now();

              return (
                <div
                  key={`${mid}-${(movie.title || "").slice(0, 20).replace(/\s+/g, "_")}`}
                  className="upcoming-card"
                  onClick={() => openMovie(movie)}
                >
                  <div className="upcoming-card-poster-wrap">
                    <img
                      className="upcoming-card-poster"
                      src={poster}
                      alt={movie.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = NO_POSTER;
                      }}
                    />
                    <div className="upcoming-card-overlay">
                      <span className="upcoming-play-icon">▶</span>
                      <span className="upcoming-play-text">View Details</span>
                    </div>
                  </div>

                  <div className="upcoming-card-info">
                    <h3 className="upcoming-card-title">{movie.title}</h3>

                    <div className="upcoming-card-meta">
                      {releaseDate && (
                        <span className="upcoming-card-date">
                          {formatShortDate(movie.release_date)}
                        </span>
                      )}
                      {isUpcoming ? (
                        <span className="upcoming-badge-soon">Upcoming</span>
                      ) : (
                        releaseDate && (
                          <span className="upcoming-badge-now">Released</span>
                        )
                      )}
                    </div>

                    {movie.description && (
                      <p className="upcoming-card-desc">
                        {movie.description.length > 100
                          ? movie.description.slice(0, 100) + "..."
                          : movie.description}
                      </p>
                    )}

                    {movie.imdb_rating > 0 && (
                      <div className="upcoming-trailer-indicator">
                        <span className="trailer-indicator-dot"></span>
                        ⭐ {movie.imdb_rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {page < totalPages && (
            <div className="upcoming-load-more">
              <button
                className="retry-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More Movies"}
              </button>
            </div>
          )}
          {page >= totalPages && upcomingMovies.length > 0 && (
            <p className="upcoming-end-note">
              You're all caught up — these are all the upcoming releases we
              know about. 🎬
            </p>
          )}
        </>
      ) : (
        <div className="upcoming-empty">
          <div className="upcoming-empty-icon">🎬</div>
          <h2>No Upcoming Movies</h2>
          <p>Check back soon for the latest upcoming releases.</p>
        </div>
      )}

      {/* Most Anticipated (top upcoming movies) */}
      <TrailerRow
        title="🔥 Most Anticipated"
        badge="Top upcoming"
        movies={anticipated}
        onOpen={openMovie}
      />

    </div>
  );
}

export default Upcoming;
