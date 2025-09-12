import { useState, useEffect } from 'react';
import { getMoviesFromTmdb, getTheatresFromFinnkino } from '../components/api';

export default function Home() {
  const [areas, setAreas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    const fetchAreas = async () => {
      const areasData = await getTheatresFromFinnkino();
      setAreas(areasData);
    };

    const fetchMovies = async () => {
      const movieData = await getMoviesFromTmdb();
      setMovies(movieData.results);
      setPageCount(movieData.total_pages);
    };

    fetchAreas();
    fetchMovies();
  }, []);

  return (
    <>
      <h1>APP</h1>
      <p>This is Finnkino data</p>

      <div>
        <select>
          {areas.map(area => (
            <option key={area.id} value={area.id}>{area.area}</option>
          ))}
        </select>

        <table>
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