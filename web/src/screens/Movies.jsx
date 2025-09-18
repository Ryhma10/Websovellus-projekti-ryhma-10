import { useState, useEffect } from "react";
import { getMoviesFromTmdb, getGenresFromTmdb } from "../components/api";
import ReactPaginate from "react-paginate";
import placeholder from '../assets/placeholder.png';
import "./Movies.css";

function Movies() {
  const [movieQuery, setMovieQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [externalMovies, setExternalMovies] = useState([]);
  const [externalGenres, setExternalGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      const movieData = await getMoviesFromTmdb(movieQuery, page);
      setExternalMovies(movieData.results || []);
      if(movieData.results && movieData.results.length > 0) {
        setPageCount(movieData.total_pages);
      } else {
        setPageCount(page);
      }
    };
    fetchMovies();
    console.log(page);
    console.log(movieQuery);
    }, [page, movieQuery]);

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
  return matchesTitle && matchesGenre;
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
      </div>
      <ReactPaginate className="pagination"
        breakLabel="..."
        nextLabel=">"
        onPageChange={(e) => setPage(e.selected + 1)} //alkuarvo 0, joten lisättävä ykkönen, määritellään sivunvaihto päivittämättä tilamuuttuja
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
    </>
  )
}

export default Movies