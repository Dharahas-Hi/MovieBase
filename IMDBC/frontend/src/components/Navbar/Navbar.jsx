import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuClapperboard } from "react-icons/lu";
import { fetchGenres } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [genres, setGenres] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showBrowseDropdown, setShowBrowseDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const genreRef = useRef(null);
  const browseRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const { data } = await fetchGenres();
        setGenres(data.slice(0, 12));
      } catch {}
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target)) setShowGenreDropdown(false);
      if (browseRef.current && !browseRef.current.contains(e.target)) setShowBrowseDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowMobileMenu(false);
    }
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left">
        <Link to="/" className="logo">
          <span className="logo-mark"><LuClapperboard /></span>
          <span className="logo-text">MOVIEBASE</span>
        </Link>
        <ul className="nav-links desktop-nav">
          <li><Link to="/" className={isActive("/") && !isActive("/movies") && !isActive("/tv-shows") && !isActive("/upcoming") ? "active" : ""}>Home</Link></li>
          <li><Link to="/upcoming" className={isActive("/upcoming") ? "active" : ""}>Upcoming</Link></li>
          <li className="nav-dropdown" ref={browseRef}>
            <span className={`nav-dropdown-trigger ${isActive("/movies") || isActive("/tv-shows") ? "active" : ""}`} onClick={() => setShowBrowseDropdown(!showBrowseDropdown)}>Browse ▾</span>
            {showBrowseDropdown && (
              <div className="nav-dropdown-menu">
                <Link to="/movies" onClick={() => setShowBrowseDropdown(false)}><span className="dropdown-icon">🎬</span> Movies</Link>
                <Link to="/tv-shows" onClick={() => setShowBrowseDropdown(false)}><span className="dropdown-icon">📺</span> TV Shows</Link>
                <Link to="/genres" onClick={() => setShowBrowseDropdown(false)}><span className="dropdown-icon">🏷️</span> Genres</Link>
                <Link to="/search" onClick={() => setShowBrowseDropdown(false)}><span className="dropdown-icon">🔍</span> Search</Link>
              </div>
            )}
          </li>
          <li className="nav-dropdown" ref={genreRef}>
            <span className={`nav-dropdown-trigger ${isActive("/genres") ? "active" : ""}`} onClick={() => setShowGenreDropdown(!showGenreDropdown)}>Genres ▾</span>
            {showGenreDropdown && genres.length > 0 && (
              <div className="nav-dropdown-menu genre-dropdown-menu">
                {genres.map((gen) => (
                  <Link key={gen.genre_id} to={`/genres/${gen.genre_id}`} onClick={() => setShowGenreDropdown(false)}>
                    {gen.genre_name}
                  </Link>
                ))}
                <Link to="/genres" className="dropdown-view-all" onClick={() => setShowGenreDropdown(false)}>View All Genres →</Link>
              </div>
            )}
          </li>
        </ul>
      </div>
      <div className="navbar-right">
        <ul className="nav-links desktop-nav">
          <li>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </li>
        </ul>
        <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="Toggle menu">
          <span className={`hamburger ${showMobileMenu ? "open" : ""}`}><span></span><span></span><span></span></span>
        </button>
      </div>
      {showMobileMenu && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} className="mobile-search-form">
            <input type="text" placeholder="Search movies & shows..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit" aria-label="Search">🔍</button>
          </form>
          <Link to="/" onClick={() => setShowMobileMenu(false)}>🏠 Home</Link>
          <Link to="/movies" onClick={() => setShowMobileMenu(false)}>🎬 Movies</Link>
          <Link to="/tv-shows" onClick={() => setShowMobileMenu(false)}>📺 TV Shows</Link>
          <Link to="/upcoming" onClick={() => setShowMobileMenu(false)}>📰 Upcoming</Link>
          <Link to="/search" onClick={() => setShowMobileMenu(false)}>🔍 Search</Link>
          <div className="mobile-genres-section">
            <div className="mobile-genres-title">🏷️ Genres</div>
            <div className="mobile-genres-grid">
              {genres.slice(0, 6).map((gen) => (
                <Link key={gen.genre_id} to={`/genres/${gen.genre_id}`} className="mobile-genre-chip" onClick={() => setShowMobileMenu(false)}>{gen.genre_name}</Link>
              ))}
              <Link to="/genres" className="mobile-genre-chip all-genres" onClick={() => setShowMobileMenu(false)}>All Genres →</Link>
            </div>
          </div>
          <button className="mobile-theme-toggle" onClick={() => { toggleTheme(); setShowMobileMenu(false); }}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
