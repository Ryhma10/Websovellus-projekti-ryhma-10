import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import './PublicFavorites.css'

function PublicFavorites() {
  const { userId } = useParams()
  const [tmdbIds, setTmdbIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    const fetchPublicFavorites = async () => {
        try {
            const favRes = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/public/${userId}`)
            if (!favRes.ok) {
                throw new Error("Failed to fetch public favorites")
            }
            const favData = await favRes.json();
            setTmdbIds(favData);
            
            const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/public/${userId}`)
            if (!userRes.ok) throw new Error ("Failed to fetch username")
            const userData = await userRes.json();
            setUsername(userData.username)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }
    fetchPublicFavorites()
  }, [userId])

  return (
    <div>
      <h2 className="public-title">{username ? `${username}'s Favorites` : "User's Favorites"}</h2>
      {loading ? (
        <p className="public-info">Loading...</p>
      ) : tmdbIds.length === 0 ? (
        <p className="public-info">No public favorites found.</p>
      ) : (
       <div className="public-grid">
          {tmdbIds.map(movie => (
            <div className="public-card" key={movie.id}>
              <h3>{movie.title}</h3>
              <img
                src={movie.poster_path
                  ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                  : "/placeholder.png"}
                alt={movie.title}
              />
              <p>{movie.overview}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PublicFavorites