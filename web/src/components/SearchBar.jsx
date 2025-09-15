import { useState, useEffect } from 'react';
import { getTheatresFromFinnkino, getDatesFromFinnkino, getMoviesFromTmdb } from './api';
import './SearchBar.css';

export default function SearchBar() {
  const [areas, setAreas] = useState([]);
  const [dates, setDates] = useState([]);
  const [movieQuery, setMovieQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [externalMovies, setExternalMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [areasData, datesData] = await Promise.all([
        getTheatresFromFinnkino(),
        getDatesFromFinnkino()
      ]);
      setAreas(areasData);
      setDates(datesData);
    };
    fetchData();
  }, []);

  // kun käyttäjä kirjoittaa hakukenttään
  useEffect(() => {
    if (!movieQuery) {
      setFilteredMovies([]);
      setExternalMovies([]);
      return;
    }

    // haetaan Finnkinosta löytyvät elokuvat
    const finnkinoTitles = [...new Set(dates.map(show => show.title))];
    const matches = finnkinoTitles.filter(title =>
      title.toLowerCase().includes(movieQuery.toLowerCase())
    );

    setFilteredMovies(matches);

    // jos Finnkinosta ei löydy mitään → haetaan TMDB:stä
    if (matches.length === 0) {
      const fetchTmdb = async () => {
        const tmdbData = await getMoviesFromTmdb();
        const tmdbMatches = tmdbData.results.filter(movie =>
          movie.title.toLowerCase().includes(movieQuery.toLowerCase())
        );
        setExternalMovies(tmdbMatches);
      };
      fetchTmdb();
    } else {
      setExternalMovies([]);
    }
  }, [movieQuery, dates]);

  const uniqueTimes = [...new Set(dates.map(show => show.start))];

  return (
    <div className="searchbar">

      <div className="search">

      {/* Teatterin valinta */}
      <select className="theatres-dropdown">
        <option value="">Valitse teatteri</option>
        {areas.map(area => (
          <option key={area.id} value={area.id}>
            {area.area}
          </option>
        ))}
      </select>

      {/* Näytösaika */}
      <select className="times-dropdown">
        <option value="">Valitse näytösaika</option>
        {uniqueTimes.map((time, i) => (
          <option key={i} value={time}>
            {new Date(time).toLocaleString('fi-FI')}
          </option>
        ))}
      </select>

      {/* Elokuvan haku inputilla */}
      <input 
        type="text"
        placeholder="Hae elokuvaa..."
        value={movieQuery}
        onChange={(e) => setMovieQuery(e.target.value)}
        className="movie-search"
      />
      </div>
      <div className="results">
      {/* Finnkino-elokuvat */}
      {filteredMovies.length > 0 && (
        <ul className="movie-results">
          {filteredMovies.map((title, i) => (
            <li key={i}>{title} (Finnkino)</li>
          ))}
        </ul>
      )}

      {/* TMDB-elokuvat jos Finnkinosta ei löytynyt */}
      {externalMovies.length > 0 && (
        <ul className="movie-results">
          {externalMovies.map((movie) => (
            <li key={movie.id}>
              {movie.title} (TMDB) <br />
              {movie.release_date} <br />
              ⭐ {movie.vote_average}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
