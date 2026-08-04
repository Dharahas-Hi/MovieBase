import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">IMDBC</div>
                        <p className="footer-text">
                            Your ultimate movie database — discover, explore, and connect with cinema.
                        </p>
                    </div>
                    <div className="footer-links-section">
                        <div className="footer-links-group">
                            <h4>Browse</h4>
                            <div className="footer-links">
                                <Link to="/">Home</Link>
                                <Link to="/movies">Movies</Link>
                                <Link to="/tv-shows">TV Shows</Link>
                                <Link to="/search">Search</Link>
                            </div>
                        </div>
                        <div className="footer-links-group">
                            <h4>Genres</h4>
                            <div className="footer-links">
                                <Link to="/genres">All Genres</Link>
                                <Link to="/genres/1">Action</Link>
                                <Link to="/genres/8">Drama</Link>
                                <Link to="/genres/5">Comedy</Link>
                            </div>
                        </div>
                        <div className="footer-links-group">
                            <h4>Discover</h4>
                            <div className="footer-links">
                                <Link to="/upcoming">Upcoming</Link>
                                <Link to="/genres">Genres</Link>
                                <Link to="/tv-shows">TV Shows</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="footer-copy">&copy; {new Date().getFullYear()} IMDBC. All rights reserved.</p>
                    <div className="footer-social">
                        <a href="#" aria-label="Twitter">𝕏</a>
                        <a href="#" aria-label="Instagram">📷</a>
                        <a href="#" aria-label="YouTube">▶</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
