import Hero from "../../components/Hero/Hero";
import MovieRow from "../../components/MovieRow/MovieRow";

import {
  trendingMovies,
  topRatedMovies,
  popularMovies,
} from "../../data/movies";

function Home() {
  return (
    <>
      <Hero />

      <MovieRow
        title="🔥 Trending Movies"
        movies={trendingMovies}
      />

      <MovieRow
        title="⭐ Top Rated Movies"
        movies={topRatedMovies}
      />

      <MovieRow
        title="🎬 Popular Movies"
        movies={popularMovies}
      />
    </>
  );
}

export default Home;