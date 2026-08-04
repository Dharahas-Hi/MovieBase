import axios from "axios";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

const API_KEY = "38ae268a5930a677b062e6a55347addd";
const READ_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOGFlMjY4YTU5MzBhNjc3YjA2MmU2YTU1MzQ3YWRkZCIsIm5iZiI6MTc4MjQ1MDcyMi40MDYwMDAxLCJzdWIiOiI2YTNlMGEyMmQyOTg2MjNmNGI3M2NmNTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.grAdA0_431qI_8Vg-RM42c_b7PzCtIyjwTxdcsMfIgc";

// ── CORS Proxy ──
// If your network blocks api.themoviedb.org, set VITE_CORS_PROXY to a proxy URL.
// Examples:
//   https://corsproxy.io/?
//   https://api.allorigins.win/raw?url=
// Create a .env file in frontend/ with: VITE_CORS_PROXY=https://corsproxy.io/?
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY || "";

const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params: {
    api_key: API_KEY,
  },
  headers: {
    Authorization: `Bearer ${READ_ACCESS_TOKEN}`,
    accept: "application/json",
  },
});

// ── Request interceptor: route through CORS proxy if configured ──
tmdb.interceptors.request.use((config) => {
  if (CORS_PROXY) {
    // Build full TMDB URL with params
    let fullUrl = `${TMDB_BASE}${config.url}`;
    if (config.params && Object.keys(config.params).length > 0) {
      const qs = new URLSearchParams();
      Object.entries(config.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) qs.set(k, String(v));
      });
      const qstr = qs.toString();
      if (qstr) fullUrl += `?${qstr}`;
    }
    // Rewrite request through proxy
    config.url = `${CORS_PROXY}${encodeURIComponent(fullUrl)}`;
    config.baseURL = "";
    config.params = {};
  }
  return config;
});

// Axios interceptor to log TMDB API errors for debugging
tmdb.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`TMDB API Error ${error.response.status}:`, error.response.data?.status_message || error.message);
    } else if (error.request) {
      console.error("TMDB API Network Error: No response received. Check your internet connection or try a CORS proxy.");
    } else {
      console.error("TMDB API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ── Image helpers ──
const posterUrl = (path, size = "w500") =>
  path ? `${IMG_BASE}/${size}${path}` : null;
const backdropUrl = (path, size = "original") =>
  path ? `${IMG_BASE}/${size}${path}` : null;

// ── Transform helpers ──

function transformMovie(movie) {
  const genres = movie.genres || [];
  return {
    movie_id: movie.id,
    id: movie.id,
    title: movie.title,
    description: movie.overview || "",
    overview: movie.overview || "",
    release_date: movie.release_date || "",
    adult: movie.adult || false,
    poster_url: posterUrl(movie.poster_path),
    backdrop_url: backdropUrl(movie.backdrop_path),
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    imdb_rating: movie.vote_average ?? 0,
    votes: movie.vote_count ?? 0,
    language: movie.original_language?.toUpperCase() || "",
    country:
      movie.production_countries?.[0]?.name ||
      movie.origin_country?.[0] ||
      null,
    genres: genres.map((g) => ({
      genre_id: g.id,
      genre_name: g.name,
      movie_count: 0,
    })),
    genre_ids: movie.genre_ids || genres.map((g) => g.id),
    tagline: movie.tagline || null,
    duration: movie.runtime || null,
    budget: movie.budget ? `$${(movie.budget / 1_000_000).toFixed(0)}M` : null,
    box_office: movie.revenue
      ? `$${(movie.revenue / 1_000_000).toFixed(0)}M`
      : null,
    director: null,
    writers: [],
    trailer_url: null,
    content_rating: null,
    streaming_platforms: [],
    awards: null,
  };
}

function transformGenre(genre) {
  return {
    genre_id: genre.id,
    genre_name: genre.name,
    movie_count: 0,
  };
}

function transformReview(review) {
  return {
    review_id: review.id,
    username: review.author_details?.username || review.author || "Anonymous",
    rating: review.author_details?.rating || 0, // TMDB 0-10 scale
    comment: review.content || "",
    created_at: review.created_at || "",
  };
}

function transformCastMember(cast) {
  return {
    cast_id: cast.cast_id || cast.id || Math.random(),
    id: cast.id,
    name: cast.name,
    character: cast.character || "",
    profile_url: posterUrl(cast.profile_path, "w185"),
    profile_path: cast.profile_path,
  };
}

function transformCrewMember(crew) {
  return {
    id: crew.id,
    name: crew.name,
    job: crew.job,
    department: crew.department,
    profile_url: posterUrl(crew.profile_path, "w185"),
  };
}

function transformImage(image) {
  return {
    image_id: image.file_path,
    file_path: image.file_path,
    file_url: backdropUrl(image.file_path, "w780"),
    width: image.width,
    height: image.height,
    aspect_ratio: image.aspect_ratio,
    type: image.type || (image.width > image.height ? "backdrop" : "poster"),
    iso_639_1: image.iso_639_1,
  };
}

function transformVideo(video) {
  return {
    id: video.id,
    key: video.key,
    site: video.site,
    type: video.type,
    name: video.name,
    official: video.official,
  };
}

// ── List helpers ──
// Transform + drop adult content so it never surfaces in browsing lists.
const toMovieList = (results) =>
  (results || []).map(transformMovie).filter((m) => !m.adult);

const toTVList = (results) =>
  (results || []).map(transformTVShow).filter((m) => !m.adult);

// Local "YYYY-MM-DD" for today (avoids UTC off-by-one-day drift).
function todayStr() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

// ── TMDB API calls ──

async function fetchPage(endpoint, page = 1, extraParams = {}) {
  const { data } = await tmdb.get(endpoint, {
    params: { page, ...extraParams },
  });
  return {
    movies: toMovieList(data.results),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
  };
}

// ── Movies ──

export const fetchMovies = async (params = {}) => {
  return fetchPage("/movie/popular", params.page || 1);
};

export const fetchAllMovies = async (onProgress) => {
  const first = await fetchPage("/movie/popular", 1);
  const total = first.total;
  const all = [...first.movies];
  if (onProgress) onProgress(all.length, total);
  const maxPages = Math.min(first.total_pages, 5);
  const remaining = [];
  for (let p = 2; p <= maxPages; p++) {
    remaining.push(fetchPage("/movie/popular", p));
  }
  const results = await Promise.all(remaining);
  results.forEach((r) => {
    all.push(...r.movies);
    if (onProgress) onProgress(all.length, total);
  });
  return { data: all, total };
};

export const fetchMoviesPage = async (
  page = 1,
  limit = 24,
  filters = {}
) => {
  // Determine which endpoint to use based on filters
  let endpoint = "/movie/popular";
  const params = { page };

  if (filters.sort === "rating" || filters.sort === "vote_average") {
    endpoint = "/discover/movie";
    params.sort_by = `vote_average.${filters.order || "desc"}`;
    params["vote_count.gte"] = 100;
    params.include_adult = false;
  } else if (filters.sort === "year" || filters.sort === "release_date") {
    endpoint = "/discover/movie";
    params.sort_by =
      filters.order === "asc"
        ? "primary_release_date.asc"
        : "primary_release_date.desc";
    params.include_adult = false;
  } else if (filters.sort === "title") {
    endpoint = "/discover/movie";
    params.sort_by = filters.order === "asc" ? "original_title.asc" : "original_title.desc";
    params.include_adult = false;
  } else if (filters.media_type === "tv") {
    endpoint = "/tv/popular";
    return fetchTVShowsPage(page, limit, filters);
  } else if (filters.category === "trending") {
    endpoint = "/trending/movie/week";
  } else if (filters.category === "now_playing") {
    endpoint = "/movie/now_playing";
  } else if (filters.category === "upcoming") {
    endpoint = "/discover/movie";
    params.sort_by = "primary_release_date.asc";
    params["primary_release_date.gte"] = todayStr();
    params.include_adult = false;
  }

  if (filters.genre) {
    endpoint = "/discover/movie";
    params.with_genres = filters.genre;
    params.include_adult = false;
    if (filters.sort) {
      params.sort_by =
        filters.sort === "rating"
          ? `vote_average.${filters.order || "desc"}`
          : filters.sort === "year"
          ? `primary_release_date.${filters.order || "desc"}`
          : `popularity.${filters.order || "desc"}`;
    }
  }

  if (filters.search) {
    endpoint = "/search/movie";
    params.query = filters.search;
    params.include_adult = false;
  }

  const { data } = await tmdb.get(endpoint, { params });
  return {
    movies: toMovieList(data.results),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
    limit,
  };
};

export const fetchMovieById = async (id) => {
  const { data } = await tmdb.get(`/movie/${id}`, {
    params: { append_to_response: "videos,credits,release_dates" },
  });
  const movie = transformMovie(data);

  // Extract director & writers from credits
  if (data.credits) {
    const director = data.credits.crew?.find((c) => c.job === "Director");
    if (director) movie.director = director.name;

    const writers = data.credits.crew
      ?.filter((c) => c.department === "Writing")
      .map((w) => w.name);
    if (writers?.length) movie.writers = writers;
  }

  // Extract trailer from videos
  if (data.videos?.results?.length) {
    const trailer = data.videos.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    if (trailer) {
      movie.trailer_url = `https://www.youtube.com/watch?v=${trailer.key}`;
    }
  }

  // Extract content rating + detect if the movie releases (or re-releases)
  // today. Re-releases show up as an extra release entry dated today, even
  // when the primary release_date is years old.
  if (data.release_dates?.results?.length) {
    const us = data.release_dates.results.find(
      (r) => r.iso_3166_1 === "US"
    );
    if (us?.release_dates?.length) {
      const cert = us.release_dates[0].certification;
      if (cert) movie.content_rating = cert;
    }

    const today = todayStr();
    movie.is_releasing_today = data.release_dates.results.some((r) =>
      (r.release_dates || []).some(
        (rd) =>
          rd.release_date &&
          String(rd.release_date).slice(0, 10) === today
      )
    );
  }

  return { data: movie };
};

export const fetchMovieRecommendations = async (id) => {
  const { data } = await tmdb.get(`/movie/${id}/recommendations`);
  return { data: toMovieList(data.results) };
};

export const fetchMovieSimilar = async (id) => {
  const { data } = await tmdb.get(`/movie/${id}/similar`);
  return { data: toMovieList(data.results) };
};

export const createMovie = () => Promise.reject(new Error("Not supported"));
export const updateMovie = () => Promise.reject(new Error("Not supported"));
export const deleteMovie = () => Promise.reject(new Error("Not supported"));

// ── Genres ──

export const fetchGenres = async () => {
  const { data } = await tmdb.get("/genre/movie/list");
  const genres = (data.genres || []).map(transformGenre);
  return { data: genres };
};

export const fetchMoviesByGenre = async (genreId, page = 1) => {
  const { data } = await tmdb.get("/discover/movie", {
    params: {
      with_genres: genreId,
      sort_by: "vote_average.desc",
      "vote_count.gte": 50,
      include_adult: false,
      page,
    },
  });
  return { data: toMovieList(data.results) };
};

// ── Cast / Crew ──

export const fetchMovieCast = async (movieId) => {
  const { data } = await tmdb.get(`/movie/${movieId}/credits`);
  return {
    data: (data.cast || []).map(transformCastMember),
    crew: (data.crew || []).map(transformCrewMember),
  };
};

// ── Reviews ──

export const fetchMovieReviews = async (movieId) => {
  const { data } = await tmdb.get(`/movie/${movieId}/reviews`);
  return { data: (data.results || []).map(transformReview) };
};

export const createReview = () => Promise.reject(new Error("Reviews are read-only via TMDB"));

// ── Gallery / Images ──

export const fetchMovieImages = async (movieId) => {
  const { data } = await tmdb.get(`/movie/${movieId}/images`);
  const all = [];
  if (data.backdrops) all.push(...data.backdrops.map(transformImage));
  if (data.posters) all.push(...data.posters.map(transformImage));
  return { data: all };
};

// ── Videos ──

export const fetchMovieVideos = async (movieId) => {
  const { data } = await tmdb.get(`/movie/${movieId}/videos`);
  return { data: (data.results || []).map(transformVideo) };
};

// ── TV Shows ──

export const fetchTVShows = async (params = {}) => {
  return fetchTVShowsPage(params.page || 1);
};

export const fetchTVShowsPage = async (page = 1, limit = 24, filters = {}) => {
  let endpoint = "/tv/popular";
  const queryParams = { page };

  if (filters.sort === "rating" || filters.category === "top_rated") {
    endpoint = "/tv/top_rated";
  } else if (filters.category === "airing_today") {
    endpoint = "/tv/airing_today";
  } else if (filters.category === "on_the_air") {
    endpoint = "/tv/on_the_air";
  }

  const { data } = await tmdb.get(endpoint, { params: queryParams });
  return {
    movies: toTVList(data.results),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
    limit,
  };
};

function transformTVShow(show) {
  const m = transformMovie(show);
  m.title = show.name || show.title;
  m.release_date = show.first_air_date || show.release_date || "";
  m.description = show.overview || "";
  return m;
}

// ── Search ──

export const searchMovies = async (query, page = 1) => {
  const { data } = await tmdb.get("/search/movie", {
    params: { query, page, include_adult: false },
  });
  return {
    movies: toMovieList(data.results),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
  };
};

export const searchMulti = async (query, page = 1) => {
  const { data } = await tmdb.get("/search/multi", {
    params: { query, page, include_adult: false },
  });
  return {
    results: (data.results || [])
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((r) =>
        r.media_type === "tv" ? transformTVShow(r) : transformMovie(r)
      )
      .filter((m) => !m.adult),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
  };
};

// ── Trending ──

export const fetchTrending = async (mediaType = "movie", timeWindow = "week") => {
  const { data } = await tmdb.get(`/trending/${mediaType}/${timeWindow}`);
  return {
    movies: (data.results || [])
      .map(mediaType === "tv" ? transformTVShow : transformMovie)
      .filter((m) => !m.adult),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
  };
};

// ── Upcoming / Now Playing ──

// Upcoming theatrical releases for a region (e.g. region = "IN", "US").
// Uses /movie/upcoming?region so the list is curated to the user's region.
// Pass region = "" to get the global upcoming list.
export const fetchUpcoming = async (page = 1, region = "") => {
  const params = { page };
  if (region) params.region = region;
  const { data } = await tmdb.get("/movie/upcoming", { params });
  return {
    movies: toMovieList(data.results),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
  };
};

// Most anticipated upcoming titles (sorted by popularity), region-aware.
export const fetchUpcomingTop = async (page = 1, region = "") => {
  const params = {
    page,
    sort_by: "popularity.desc",
    "primary_release_date.gte": todayStr(),
    include_adult: false,
  };
  if (region) params.region = region;
  const { data } = await tmdb.get("/discover/movie", { params });
  return {
    movies: toMovieList(data.results),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
  };
};

export const fetchNowPlaying = async (page = 1) => {
  const { data } = await tmdb.get("/movie/now_playing", { params: { page } });
  return {
    movies: toMovieList(data.results),
    page: data.page,
    total_pages: data.total_pages,
    total: data.total_results,
  };
};

// ── Unused stubs (kept to avoid import errors in stale pages) ──
export const loginUser = () => Promise.reject(new Error("Not available"));
export const registerUser = () => Promise.reject(new Error("Not available"));
export const getCurrentUser = () => Promise.reject(new Error("Not available"));

export default tmdb;
