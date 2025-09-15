import { useState, useEffect } from "react";
import { getMoviesFromTmdb } from "../components/api";
import ReactPaginate from "react-paginate";
import placeholder from '../assets/placeholder.png';
import "./Movies.css";

function Movies() {
  const [movieQuery, setMovieQuery] = useState("");
  const [externalMovies, setExternalMovies] = useState([]);
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
      const movieMatches = (movieData.results || movieData).filter(movie => 
        movie.title && movie.title.toLowerCase().includes(movieQuery.toLowerCase())
      );
      setExternalMovies(movieMatches);
      setPageCount(movieData.total_pages);
    };
    fetchMovies();
    console.log(page);
    console.log(movieQuery);
    console.log(externalMovies);
  }, [page, movieQuery]);

  return (
    <>
      <h1 className="movies">Find Your Favorite Movies</h1>

      <input 
        type="text"
        placeholder="Hae Elokuvia..."
        value={movieQuery}
        onChange={(e) => setMovieQuery(e.target.value)}
        className="movie-search"
      />
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
          {externalMovies.map(movie => (
            <li className="movie-item" key={movie.id}>
            {!movie.poster_path ? (
              <img src={placeholder} alt="Placeholder" className="placeholder-image" />
            ) : (
              <img className="movie-poster"
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
              />
            )}
              <div className="movie-info">
              {movie.title} <br />
              {/* {movie.release_date} <br />
              {/* ⭐ {movie.vote_average} */}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Movies