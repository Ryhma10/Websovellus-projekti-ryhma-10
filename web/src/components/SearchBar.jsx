import { useState, useEffect } from 'react';
import { getTheatresFromFinnkino, getDatesFromFinnkino} from './api';
import './SearchBar.css';

export default function SearchBar() {
  const [areas, setAreas] = useState([]);
  const [dates, setDates] = useState([]);
  const [movieQuery, setMovieQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const areasData = await getTheatresFromFinnkino();
      setAreas(areasData);
      const areaIds = areasData.map(area => area.id);
      const datesData = await getDatesFromFinnkino(areaIds);
      setDates(datesData);
    };
    fetchData();
  }, []);

  // kun käyttäjä kirjoittaa hakukenttään
  useEffect(() => {
    let filtered = dates;

    // Jos etsitään vain elokuvanimellä (jos käyttäjä on kirjoittanut jotain hakukenttään)
    if(movieQuery.trim() !== '') {
      filtered = filtered.filter(show => 
        show.title.toLowerCase().includes(movieQuery.toLowerCase())
      );
    }

    // Jos etsitään vain teatterin perusteella (jos käyttäjä on valinnut teatterin)
    if(selectedArea.trim() !== '') {
      filtered = filtered.filter(show => 
        show.theatreId === selectedArea
      );
    }

    // Jos etsitään vain näytösajan perusteella (jos käyttäjä on valinnut näytösajan)
    if(selectedTime.trim() !== '') {
      filtered = filtered.filter(show => 
        show.start === selectedTime
      );
    }
    setFilteredMovies(filtered);
  }, [movieQuery, selectedArea, selectedTime, dates]);

  const uniqueTimes = [...new Set(dates.map(show => show.start))];
  const uniqueTheatres = areas;

  return (
    <div className="searchbar">
      <div className="search">
        {/* Elokuvan haku inputilla */}
      <input 
        type="text"
        placeholder="Search Finnkino..."
        value={movieQuery}
        onChange={(e) => setMovieQuery(e.target.value)}
        className="movie-search"
      />

      {/* Teatterin valinta */}
      <select
          className="theatres-dropdown"
          value={selectedArea}
          onChange={e => setSelectedArea(e.target.value)}
        >
          <option value="">Select theatre</option>
          {uniqueTheatres.map((theatre, i) => (
            <option key={theatre.id} value={theatre.id}>
              {theatre.area}
            </option>
          ))}
        </select>

      {/* Näytösaika */}
      <select
          className="times-dropdown"
          value={selectedTime}
          onChange={e => setSelectedTime(e.target.value)}
        >
          <option value="">Select showtime</option>
          {uniqueTimes.map((time, i) => (
            <option key={i} value={time}>
              {new Date(time).toLocaleString('fi-FI')}
            </option>
          ))}
        </select>
      </div>
      <div className="results">
      {/* Finnkino-elokuvat */}
      {(movieQuery.trim() !== '' || selectedArea.trim() !== '' || selectedTime.trim() !== '') && filteredMovies.length > 0 && (
          <ul className="movie-results">
            {filteredMovies.map((show, i) => (
              <li className="movie-result-item" key={i}>
                {show.image && (
                  <img className="show-poster"
                    src={show.image} 
                    alt={show.title}
                  />
                )}
                <div className="show-info">
                  {show.title} <br /> ({show.theatre}, {new Date(show.start).toLocaleString('fi-FI')})
                </div>
              </li>
            ))}
          </ul>
      )}
      </div>
    </div>
  );
}
