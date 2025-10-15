import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import SignIn from "./Signin.jsx"
import './Favorites.css'

// Helper to decode JWT and get userId
function getUserIdFromToken(token) {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.id || payload.sub
  } catch {
    return null
  }
}

function Favorites() {
  const [movies, setMovies] = useState([])
  const [shareLink, setShareLink] = useState("")
  const navigate = useNavigate()
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setShowSignInModal(true)
        return
      }
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user_favorites`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setMovies(data)
    }
    fetchFavorites()
  }, [navigate])

  // Get userId from JWT token
  const token = localStorage.getItem("token")
  const userId = getUserIdFromToken(token)

  const handleLinkClick = () => {
    setShareLink("");
  }

  const handleShareClick = () => {
    if (userId) {
      const url = `${window.location.origin}/public/${userId}`
      setShareLink(url);
      setCopied(false)
    }
  }

    const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true);
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

   if (showSignInModal) {
    return (
      <SignIn
        isOpen={true}
        onClose={() => {
          setShowSignInModal(false)
          navigate("/")
        }}
        onLoginSuccess={() => {
          setShowSignInModal(false)
          window.location.reload() // reload to fetch favorites after login
        }}
      />
    )
  }

   return (
    <div>
      <h1 className="favorites-title">Your Favorites</h1>
      <button onClick={handleShareClick} disabled={!userId}>
        Share Favorites
      </button>

      {shareLink && (
        <div className="share-link-box">
          <p>Share this link:</p>
          <div className="share-link-row">
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="share-link"
            >
              {shareLink}
            </a>
            <button onClick={handleCopyLink} className="copy-button">
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
      <div className="favorites-list">
        {movies.length === 0 ? (
          <p>No favorites yet.</p>
        ) : (
          movies.map(movie => (
          <div key={movie.id} className="favorite-movie">
            <h3>{movie.title}</h3>
            <img
              src={movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "/placeholder.png"}
              alt={movie.title}
            />
            <p>{movie.overview}</p>
          </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Favorites
