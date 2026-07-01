import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                IMDBC
            </div>

            <ul className="nav-links">

                <li>
                    <Link to="/search">Search</Link>
                </li>

                <li>
                    <Link to="/">Home</Link>
                </li>


                <li>
                    <Link to="/genres">Genres</Link>
                </li>

                <li>
                    <Link to="/login">Login</Link>
                </li>

            </ul>
        </nav>
    );
}

export default Navbar;