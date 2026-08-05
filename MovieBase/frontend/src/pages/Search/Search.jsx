import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMulti, fetchTrending } from "../../services/api";
import "./Search.css";

import SearchBar from "../../components/SearchBar/SearchBar";
import MovieCard from "../../components/MovieCard/MovieCard";

function Search() {
    const [searchParams] = useSearchParams();
    const queryParam = searchParams.get("q") || "";
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const debounceRef = useRef(null);

    // Load initial movies (trending or from URL query)
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                let moviesList;
                if (queryParam) {
                    const data = await searchMulti(queryParam);
                    moviesList = data.results || [];
                } else {
                    const data = await fetchTrending("movie", "week");
                    moviesList = data.movies || [];
                }
                setResults(moviesList);
            } catch (error) {
                console.error("Failed to load movies", error);
                setError("Unable to load movies. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [queryParam]);

    // Debounced search when user types in the search bar
    const handleSearch = (query) => {
        // Clear existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const trimmed = query.trim();

        if (!trimmed) {
            // Reload trending when query is cleared
            debounceRef.current = setTimeout(async () => {
                setSearching(true);
                try {
                    const data = await fetchTrending("movie", "week");
                    setResults(data.movies || []);
                } catch {
                    // ignore
                } finally {
                    setSearching(false);
                }
            }, 300);
            return;
        }

        // Debounce the API call by 400ms
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await searchMulti(trimmed);
                setResults(data.results || []);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setSearching(false);
            }
        }, 400);
    };

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    if (error) {
        return (
            <div className="search-page">
                <div className="search-header">
                    <div className="search-title">
                        <h1>Discover Movies</h1>
                        <p>Search from thousands of movies.</p>
                    </div>
                </div>
                <div className="error-state">
                    <div className="error-icon">!</div>
                    <h2>Connection Error</h2>
                    <p>{error}</p>
                    <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
                </div>
            </div>
        );
    }

    const showLoading = loading || searching;

    return (
        <div className="search-page">

            <div className="search-header">
                <div className="search-title">
                    <h1>Discover Movies & TV Shows</h1>
                    <p>Search from thousands of movies and TV shows.</p>
                </div>
            </div>

            <div className="search-box">
                <SearchBar onSearch={handleSearch} />
            </div>

            {showLoading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                </div>
            ) : results.length > 0 ? (
                <div className="search-results-grid">
                    {results.map((movie, idx) => (
                        <MovieCard
                            key={`${movie.movie_id ?? movie.id}-${idx}`}
                            movie={movie}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-search">
                    <h2>No Results Found</h2>
                    <p>Try searching with another title or keyword.</p>
                </div>
            )}

        </div>
    );
}

export default Search;