import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { fetchTrending } from "../../services/api";
import { getYear } from "../../utils/date";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Hero.css";

const FALLBACK_BG = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80";

function HeroSkeleton() {
  return (
    <div className="hero-swiper" style={{ height: "85vh", background: "var(--bg-secondary)" }}>
      <div className="hero" style={{ height: "85vh", background: "var(--bg-secondary)" }}>
        <div className="hero-overlay" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)" }}>
          <div style={{ width: 120, height: 28, background: "var(--bg-elevated)", borderRadius: 30, marginBottom: 16 }} />
          <div style={{ width: 500, height: 52, background: "var(--bg-elevated)", borderRadius: 8, marginBottom: 14, maxWidth: "90%" }} />
          <div style={{ width: 300, height: 18, background: "var(--bg-elevated)", borderRadius: 6, marginBottom: 30, maxWidth: "70%" }} />
          <div style={{ width: 400, height: 72, background: "var(--bg-elevated)", borderRadius: 8, marginBottom: 30, maxWidth: "90%" }} />
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ width: 160, height: 50, background: "var(--bg-elevated)", borderRadius: 40 }} />
            <div style={{ width: 160, height: 50, background: "var(--bg-elevated)", borderRadius: 40 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTrending("movie", "week");
        setMovies((data.movies || []).filter((m) => !m.adult).slice(0, 8));
      } catch (e) {
        console.error("Hero failed to load:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <HeroSkeleton />;
  if (movies.length === 0) return null;

  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      loop={movies.length > 1}
      pagination={{ clickable: true }}
      navigation
      className="hero-swiper"
    >
      {movies.map((movie) => {
        const bg = movie.backdrop_url || movie.poster_url || FALLBACK_BG;
        const year = getYear(movie.release_date);

        return (
          <SwiperSlide key={movie.movie_id}>
            <section className="hero" style={{ backgroundImage: `url(${bg})` }}>
              <div className="hero-overlay">
                <div className="hero-badge">⭐ {movie.imdb_rating ? `${movie.imdb_rating.toFixed(1)}` : "N/A"}</div>
                <h1>{movie.title}</h1>

                <div className="hero-meta">
                  {year && <span>{year}</span>}
                  {movie.language && (
                    <>
                      <span className="meta-divider">•</span>
                      <span>{movie.language}</span>
                    </>
                  )}
                  {movie.duration && (
                    <>
                      <span className="meta-divider">•</span>
                      <span>{movie.duration} min</span>
                    </>
                  )}
                </div>

                <p>{movie.description || "No description available."}</p>

                <div className="hero-buttons">
                  <button className="watch-btn" onClick={() => navigate(`/trailer/${movie.movie_id}`)}>
                    ▶ Watch Trailer
                  </button>
                  <button className="details-btn" onClick={() => navigate(`/movie/${movie.movie_id}`)}>
                    More Details
                  </button>
                </div>
              </div>
            </section>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

export default Hero;
