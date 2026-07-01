import "./SearchBar.css";
import { useState } from "react";

function SearchBar({ movies, onSearch }) {

    const [query, setQuery] = useState("");

    function handleChange(e) {

        const value = e.target.value;

        setQuery(value);

        const filtered = movies.filter(movie =>
            movie.title.toLowerCase().includes(value.toLowerCase())
        );

        onSearch(filtered);

    }

    return (

        <div className="search-bar">

            <input type="text" placeholder="Search Movies..." value={query} onChange={handleChange} />

        </div>

    );

}

export default SearchBar;