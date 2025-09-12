import { useState, useEffect } from 'react';
import { getMoviesFromTmdb, getTheatresFromFinnkino } from '../components/api';
import './Home.css';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      const movieData = await getMoviesFromTmdb();
      setMovies(movieData.results);
    };

    fetchMovies();
  }, []);

  return (
    <>
    <header>
      <h1>Mad Moose Movies</h1>
    </header>

      <div className="movie-table-container">
        <table className="movie-table">
          <thead>
            <tr><th>Title</th></tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie.id}>
                <td>{movie.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}