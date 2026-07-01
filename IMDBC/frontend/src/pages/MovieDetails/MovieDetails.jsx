import "./MovieDetails.css";
import { useParams } from "react-router-dom";

import {
  trendingMovies,
  topRatedMovies,
  popularMovies,
} from "../../data/movies";

function MovieDetails() {

    const { id } = useParams();

    const movies = [
        ...trendingMovies,
        ...topRatedMovies,
        ...popularMovies,
    ];

    const movie = movies.find(
        (m) => m.id === Number(id)
    );

    if (!movie) {
        return <h1>Movie Not Found</h1>;
    }

    return (

        <div className="details-page">

            <div
                className="details-banner"

                style={{
                    backgroundImage:`url(${movie.backdrop})`
                }}
            >

                <div className="details-overlay">

                    <img
                        className="details-poster"
                        src={movie.poster}
                        alt={movie.title}
                    />

                    <div className="details-info">

                        <h1>{movie.title}</h1>

                        <div className="meta">

                            ⭐ {movie.rating}

                            • {movie.year}

                            • {movie.duration}

                            • {movie.genre}

                        </div>

                        <p className="description">

                            {movie.description}

                        </p>

                        <button className="watch">

                            ▶ Watch Trailer

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default MovieDetails;