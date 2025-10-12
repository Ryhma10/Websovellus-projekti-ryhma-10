import { useState, useEffect } from 'react'
import { getTheatresFromFinnkino, getDatesFromFinnkino } from './api'
import './SearchBar.css'

/**
 * Props:
 * - embedded (boolean): kun true, komponentti EI piirrä omaa tuloslistaa
 * - onResults (function): callback, jolle lähetetään normalisoidut tulokset
 */
export default function SearchBar({ embedded = false, onResults }) {
  const [areas, setAreas] = useState([])
  const [dates, setDates] = useState([])
  const [movieQuery, setMovieQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [filteredMovies, setFilteredMovies] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areasData = await getTheatresFromFinnkino();
        console.log('[FK] areasData len:', areasData?.length, 'sample:', areasData?.[0]);
        setAreas(areasData);

        // Hae näytökset KAIKILLE alueil­le – ei mitään firstAreaId:ia
        const areaIds = (areasData || []).map(a => a.id).filter(Boolean);
        console.log('[FK] areaIds count:', areaIds.length, areaIds.slice(0,5));

        const datesData = await getDatesFromFinnkino(areaIds);
        console.log('[FK] datesData len:', datesData?.length, datesData?.[0]);
        setDates(datesData);
      } catch (err) {
        console.error('Finnkino fetch failed:', err);
        setAreas([]);
        setDates([]);
      }
    };
    fetchData();
  }, []);

  // suodatus
  useEffect(() => {
    let filtered = dates

    if (movieQuery.trim() !== '') {
      filtered = filtered.filter(show =>
        (show.title || '').toLowerCase().includes(movieQuery.toLowerCase())
      )
    }

    if (selectedArea.trim() !== '') {
      filtered = filtered.filter(show => {
        //String(show.theatreId) === String(selectedArea)
        const sid = 
          show.theatreId ??
          show.TheatreID ??
          show.theatre_id ??
          show.theatreID ??
          null

          //jos riviltä puuttuu teatteri-id kokonaan, älä tiputa sitä pois
          if (!sid) return true
          return String(sid) === String(selectedArea)
    })
    }

    if (selectedTime.trim() !== '') {
      filtered = filtered.filter(show =>
        String(show.start) === String(selectedTime) // <- korjattu Sring -> String
      )
    }

    setFilteredMovies(filtered)

    console.log("[FK] after filters len:", filtered.length, filtered[0]);

  }, [movieQuery, selectedArea, selectedTime, dates])

  // Lähetä tulokset GroupPagelle "flat"-muodossa
  // Lähetä tulokset GroupPagelle "flat"-muodossa
useEffect(() => {
  if (typeof onResults !== 'function') return;
  if (!Array.isArray(filteredMovies)) { onResults([]); return; }

  const normalized = filteredMovies
    .map(show => {
      const id = Number(
        show.eventId ?? show.EventID ?? show.eventID ?? show.ID ?? show.id
      );
      if (!Number.isFinite(id)) return null;

      return {
        id,
        title: show.title || '',
        posterUrl: show.image ?? null,
        theatre: show.theatre ?? show.Theatre ?? '',
        theatreId: String(show.theatreId ?? show.TheatreID ?? ''),
        start: show.start,
        year: show.start ? new Date(show.start).getFullYear() : null,
        raw: show
      };
    })
    .filter(Boolean);

  console.log('[FK] normalized len:', normalized.length, normalized[0]);
  onResults(normalized);
}, [filteredMovies, onResults]);


  const uniqueTimes = [...new Set(dates.map(show => show.start))]
  const uniqueTheatres = areas

  return (
    <div className="searchbar">
      <div className="search">
        <input
          type="text"
          placeholder="Search Finnkino..."
          value={movieQuery}
          onChange={(e) => setMovieQuery(e.target.value)}
          className="movie-search"
        />

        <select
          className="theatres-dropdown"
          value={selectedArea}
          onChange={e => setSelectedArea(e.target.value)}
        >
          <option value="">Select theatre</option>
          {uniqueTheatres.map(theatre => (
            <option key={theatre.id} value={theatre.id}>
              {theatre.area}
            </option>
          ))}
        </select>

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

      {/* Kun embedded = true, ei piirretä omaa listaa (GroupPage hoitaa renderöinnin) */}
      {!embedded && (movieQuery.trim() !== '' || selectedArea.trim() !== '' || selectedTime.trim() !== '') && filteredMovies.length > 0 && (
        <div className="results">
          <ul className="movie-results">
            {filteredMovies.map((show, i) => (
              <li className="movie-result-item" key={show.eventId ?? show.EventID ?? show.ID ?? i}>
                {show.image && (
                  <img
                    className="show-poster"
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
        </div>
      )}
    </div>
  )
}
