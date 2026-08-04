import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/PageTransition/PageTransition";
import Home from "./pages/Home/Home";
import Movies from "./pages/Movies/Movies";
import MovieDetails from "./pages/MovieDetails/MovieDetails";
import Search from "./pages/Search/Search";
import Genres from "./pages/Genres/Genres";
import GenreMovies from "./pages/GenreMovies/GenreMovies";
import TVShows from "./pages/TVShows/TVShows";
import Upcoming from "./pages/Upcoming/Upcoming";
import TrailerWatch from "./pages/TrailerWatch/TrailerWatch";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/movie/:id" element={<PageTransition><MovieDetails /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/genres" element={<PageTransition><Genres /></PageTransition>} />
        <Route path="/genres/:id" element={<PageTransition><GenreMovies /></PageTransition>} />
        <Route path="/tv-shows" element={<PageTransition><TVShows /></PageTransition>} />
        <Route path="/upcoming" element={<PageTransition><Upcoming /></PageTransition>} />
        <Route path="/trailer/:id" element={<PageTransition><TrailerWatch /></PageTransition>} />
        <Route path="/movies" element={<PageTransition><Movies /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
