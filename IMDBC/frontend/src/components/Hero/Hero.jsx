import "./Hero.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const heroMovies = [
  {
    title: "Avengers: Endgame",
    overview:
      "After the devastating events of Infinity War, the Avengers assemble one last time.",
    backdrop:
      "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
  },
  {
    title: "Interstellar",
    overview:
      "A team of explorers travel through a wormhole in space to ensure humanity's survival.",
    backdrop:
      "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
  },
  {
    title: "The Batman",
    overview:
      "Batman ventures into Gotham City's underworld to uncover corruption.",
    backdrop:
      "https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
  },
];

function Hero() {
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      autoplay={{ delay: 5000 }}
      loop={true}
      pagination={{ clickable: true }}
      navigation
      className="hero-swiper"
    >
      {heroMovies.map((movie, index) => (
        <SwiperSlide key={index}>
          <section
            className="hero"
            style={{
              backgroundImage: `url(${movie.backdrop})`,
            }}
          >
            <div className="hero-overlay">
              <h1>{movie.title}</h1>

              <p>{movie.overview}</p>

              <div className="hero-buttons">
                <button className="watch-btn">
                  ▶ Watch Trailer
                </button>

                <button className="details-btn">
                  More Details
                </button>
              </div>
            </div>
          </section>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default Hero;