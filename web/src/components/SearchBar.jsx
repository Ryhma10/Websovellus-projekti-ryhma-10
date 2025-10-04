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
      const areasData = await getTheatresFromFinnkino()
      setAreas(areasData)
      const areaIds = areasData.map(area => area.id)
      const datesData = await getDatesFromFinnkino(areaIds)
      setDates(datesData)
    }
    fetchData()
  }, [])

  // suodatus
  useEffect(() => {
    let filtered = dates

    if (movieQuery.trim() !== '') {
      filtered = filtered.filter(show =>
        (show.title || '').toLowerCase().includes(movieQuery.toLowerCase())
      )
    }

    if (selectedArea.trim() !== '') {
      filtered = filtered.filter(show =>
        String(show.theatreId) === String(selectedArea)
      )
    }

    if (selectedTime.trim() !== '') {
      filtered = filtered.filter(show =>
        String(show.start) === String(selectedTime) // <- korjattu Sring -> String
      )
    }

    setFilteredMovies(filtered)
  }, [movieQuery, selectedArea, selectedTime, dates])

  // Normalisoi ja lähetä tulokset ylöspäin, jos callback annettu
  useEffect(() => {
    if (typeof onResults !== 'function') return

    const normalized = (filteredMovies || [])
      .map(show => ({
        id: Number(show.eventId ?? show.EventID ?? show.ID ?? show.id), // sinulla on eventId → ok
        title: show.title,
        posterUrl: show.image ?? null,
        theatre: show.theatre,
        theatreId: show.theatreId,
        start: show.start,
        year: show.start ? new Date(show.start).getFullYear() : null,
        raw: show
      }))
      .filter(m => Number.isFinite(m.id))

    onResults(normalized)
  }, [filteredMovies, onResults])

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
