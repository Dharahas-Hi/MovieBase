import "./GenreCard.css";
import { Link } from "react-router-dom";

function GenreCard({ genre }) {
    return (
        <Link to={`/genres/${genre.genre_id}`} className="genre-card-link">
            <div className="genre-card">
                <div className="genre-card-icon">
                    {genre.genre_name[0]}
                </div>
                <h3>{genre.genre_name}</h3>
                <p>{genre.movie_count ?? 0} movies</p>
            </div>
        </Link>
    );
}

export default GenreCard;
