import { useState, useEffect } from "react"
import ReactPaginate from "react-paginate"
import placeholder from '../assets/placeholder.png'
import "./Movies.css"
import PopularCarousel from "../components/PopularCarousel"
import MovieModal from "../components/MovieModal"

function Movies() {
  const [movieQuery, setMovieQuery] = useState("")
  const [genreQuery, setGenreQuery] = useState("")
  const [yearQuery, setYearQuery] = useState("")
  const [externalMovies, setExternalMovies] = useState([])
  const [externalGenres, setExternalGenres] = useState([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [popular, setPopular] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

  // Fetch movies whenever movieQuery or page changes
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tmdb/search?query=${movieQuery}&page=${page}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const movieData = await res.json()
        setExternalMovies(movieData.results || [])
        setPageCount(movieData.total_pages || 1)
      } catch (err) {
        console.error("Failed to fetch movies:", err)
      }
    }
    if (movieQuery.trim() !== "") {
      fetchMovies()
    } else {
      setExternalMovies([])
      setPageCount(1)
    }
  }, [movieQuery, page])

  // Fetch popular movies once
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tmdb/popular`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await res.json()
        setPopular(data || [])
      } catch (err) {
        console.error("Failed to fetch popular movies:", err)
      }
    }
    fetchPopular()
  }, [])

  // Fetch genres once
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const token = localStorage.getItem("token")
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tmdb/genres`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const genreData = await res.json()
        setExternalGenres(genreData.genres || []) // Take the array from the response
      } catch (err) {
        console.error("Failed to fetch genres:", err)
      }
    }
    fetchGenres()
  }, [])

  // Filter movies based on genre and year
  const filteredMovies = externalMovies.filter(movie => {
    const matchesTitle =
      movieQuery.trim() === "" ||
      (movie.title && movie.title.toLowerCase().includes(movieQuery.toLowerCase()))

    const matchesGenre =
      genreQuery === "" ||
      (movie.genre_ids && movie.genre_ids.includes(Number(genreQuery)))

    const matchesYear =
      yearQuery === "" ||
      (movie.release_date && movie.release_date.startsWith(yearQuery))

    return matchesTitle && matchesGenre && matchesYear
  })

  return (
    <>
      <h1 className="movies">Find Your Favorite Movies</h1>

      <div className="all-movies-search">
        <input
          type="text"
          placeholder="Search Movies..."
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

      {filteredMovies.length > 0 && (
        <ReactPaginate
          className="pagination"
          breakLabel="..."
          nextLabel=">"
          onPageChange={(e) => setPage(e.selected + 1)}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="<"
          renderOnZeroPageCount={null}
        />
      )}

      <div className="movie-table-container">
        <ul className="movie-results">
          {filteredMovies.map(movie => (
            <li className="movie-item" key={movie.id}>
              <div className="poster-box">
                <img
                  className={movie.poster_path ? "movie-poster" : "placeholder-image"}
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                      : placeholder
                  }
                  alt={movie.title}
                  onClick={() => {
                    setSelectedMovie(movie)
                    setShowModal(true)
                  }}
                />
              </div>
              <div className="movie-info">{movie.title}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Show popular carousel if no search query */}
      {movieQuery.trim() === "" && popular.length > 0 && <PopularCarousel movies={popular} />}

      {/* Modal for selected movie */}
      {showModal && selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default Movies
