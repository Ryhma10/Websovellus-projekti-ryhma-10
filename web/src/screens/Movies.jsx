import { useState, useEffect } from "react";
import { getMoviesFromTmdb, getGenresFromTmdb, getPopularMoviesFromTmdb } from "../components/api";
import ReactPaginate from "react-paginate";
import placeholder from '../assets/placeholder.png';
import "./Movies.css";
import PopularCarousel from "../components/PopularCarousel"; //Tuodaan karuselli

function Movies() {
  const [movieQuery, setMovieQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [yearQuery, setYearQuery] = useState("");
  const [externalMovies, setExternalMovies] = useState([]);
  const [externalGenres, setExternalGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [popular, setPopular] = useState([]); // Tarkistetaan suosituimmat elokuvat

  // tehdään lista vuosista 1900 -> nykyhetki
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchMovies = async () => {
      const movieData = await getMoviesFromTmdb(movieQuery, page);
      setExternalMovies(movieData.results || []);
      if (movieData.results && movieData.results.length > 0) {
        setPageCount(movieData.total_pages);
      } else {
        setPageCount(page);
      }
    };
    fetchMovies();
  }, [page, movieQuery]);
    
  useEffect(() => {
    const fetchPopular = async () => {
     const data = await getPopularMoviesFromTmdb(); //Haetaan TMDB:stä suosituimmat elokuvat
      setPopular(data || []);
    };
    fetchPopular();  //Haetaan vain kerran komponentin alussa
    }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      const genreData = await getGenresFromTmdb();
      setExternalGenres(genreData);
    };
    fetchGenres();
  }, [page, movieQuery, genreQuery]);

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
              />
              <div className="movie-info">
                {movie.title}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {movieQuery.trim() === "" && popular.length > 0 && <PopularCarousel movies={popular} />}
    </> //Näytetään karuselli, jos hakukenttä on tyhjä
  )
}

export default Movies
