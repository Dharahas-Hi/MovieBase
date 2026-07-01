import { useState } from "react";

import SearchBar from "../../components/SearchBar/SearchBar";
import MovieCard from "../../components/MovieCard/MovieCard";

import {
    trendingMovies,
    topRatedMovies,
    popularMovies
} from "../../data/movies";

function Search(){

    const allMovies = [
        ...trendingMovies,
        ...topRatedMovies,
        ...popularMovies
    ];

    const [results,setResults]=useState(allMovies);

    return(

        <>

            <SearchBar
                movies={allMovies}
                onSearch={setResults}
            />

            <div className="movie-container">

                {
                    results.map(movie=>(

                        <MovieCard
                            key={movie.id}
                            movie={movie}
                        />

                    ))
                }

            </div>

        </>

    )

}

export default Search;