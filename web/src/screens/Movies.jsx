import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import placeholder from '../assets/placeholder.png';
import "./Movies.css";
import PopularCarousel from "../components/PopularCarousel"; //Tuodaan karuselli
import MovieModal from "../components/MovieModal"; // Tuodaan elokuvan tiedot -modal

function Movies() {
  const [movieQuery, setMovieQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced value
  const [genreQuery, setGenreQuery] = useState("");
  const [yearQuery, setYearQuery] = useState("");
  const [externalMovies, setExternalMovies] = useState([]);
  const [externalGenres, setExternalGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [popular, setPopular] = useState([]); // Tarkistetaan suosituimmat elokuvat
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // tehdään lista vuosista 1900 -> nykyhetki
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(movieQuery);
    }, 500); // 500ms debounce delay

    // Clear the timeout if the input changes before the delay is over
    return () => {
      clearTimeout(handler);
    };
  }, [movieQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch movies using the debounced query
        const movieResponse = await fetch(`http://localhost:3001/api/apis/?query=${debouncedQuery}&page=${page}`, {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        });

        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          setExternalMovies(movieData.results || []);
          setPageCount(movieData.total_pages || 0);
        } else {
          console.error("Failed to fetch movies:", movieResponse.statusText);
        }

        // Fetch popular movies
        const popularResponse = await fetch("http://localhost:3001/api/apis/popular", {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        });

        if (popularResponse.ok) {
          const popularData = await popularResponse.json();
          setPopular(popularData || []);
        } else {
          console.error("Failed to fetch popular movies:", popularResponse.statusText);
        }

        // Fetch genres
        const genreResponse = await fetch("http://localhost:3001/api/apis/genres", {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        });

        if (genreResponse.ok) {
          const genreData = await genreResponse.json();
          setExternalGenres(genreData || []);
        } else {
          console.error("Failed to fetch genres:", genreResponse.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    if (debouncedQuery.trim() !== "") {
      fetchData();
    }
  }, [debouncedQuery, page]); // Run this effect whenever `debouncedQuery` or `page` changes

  const filteredMovies = externalMovies.filter(movie => {
    const matchesTitle =
      movieQuery.trim() === "" ||
      (movie.title && movie.title.toLowerCase().includes(movieQuery.toLowerCase()));

    const matchesGenre =
      genreQuery === "" ||
      (movie.genre_ids && movie.genre_ids.includes(Number(genreQuery)));

    const matchesYear =
      yearQuery === "" ||
      (movie.release_date && movie.release_date.startsWith(yearQuery));

    return matchesTitle && matchesGenre && matchesYear;

  });

  return (
    <>
      <h1 className="movies">Find Your Favorite Movies</h1>
      <div className="all-movies-search">
        <input
          type="text"
          placeholder="Hae Elokuvia..."
          value={movieQuery}
          onChange={(e) => setMovieQuery(e.target.value)}
          className="movie-search"
        />
        <select
          value={genreQuery}
          onChange={e => setGenreQuery(e.target.value)}
          className="genre-select"
        >
          <option value="">All genres</option>
          {externalGenres.map(genre => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <select
          value={yearQuery}
          onChange={(e) => setYearQuery(e.target.value)}
          className="year-select"
        >
          <option value="">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

      </div>
      <ReactPaginate className="pagination"
        breakLabel="..."
        nextLabel=">"
        onPageChange={(e) => setPage(e.selected + 1)}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="<"
        renderOnZeroPageCount={null}
      />

      <div className="movie-table-container">
        <ul className="movie-results">
          {filteredMovies.map(movie => (
            <li className="movie-item" key={movie.id}>
              <img
                className={movie.poster_path ? "movie-poster" : "placeholder-image"}
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                    : placeholder
                }
                alt={movie.title}
                onClick={() => {
                  setSelectedMovie(movie);
                  setShowModal(true);
                }}
              />
              <div className="movie-info">
                {movie.title}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {movieQuery.trim() === "" && popular.length > 0 && <PopularCarousel movies={popular} />}
      {showModal && selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setShowModal(false)}
        />
      )}
    </> //Näytetään karuselli, jos hakukenttä on tyhjä
  )
}

export default Movies
