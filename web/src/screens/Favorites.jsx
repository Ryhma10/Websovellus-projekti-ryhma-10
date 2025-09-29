import { useEffect, useState } from "react";
import './Favorites.css';

// Helper to decode JWT and get userId
function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || payload.sub;
  } catch {
    return null;
  }
}

function Favorites() {
  const [movies, setMovies] = useState([]);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/user_favorites", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setMovies(data);
    };
    fetchFavorites();
  }, []);

  // Get userId from JWT token
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken(token);

  const handleShareClick = () => {
    if (userId) {
      const url = `${window.location.origin}/public/${userId}`;
      setShareLink(url);
    }
  };

  return (
    <div>
      <h2 className="favorites-title">Your Favorites</h2>
      <button onClick={handleShareClick} disabled={!userId}>
        Share Favorites
      </button>
      {shareLink && (
        <div>
          <p>Share this link:</p>
          <a href={shareLink} target="_blank" rel="noopener noreferrer">{shareLink}</a>
        </div>
      )}
      <div className="favorites-list">
        {movies.length === 0 ? (
          <p>No favorites yet.</p>
        ) : (
          movies.map(movie => (
            <div key={movie.id} className="favorite-movie">
              <img
                src={movie.poster_path
                  ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                  : "/placeholder.png"}
                alt={movie.title}
              />
              <h3>{movie.title}</h3>
              <p>{movie.overview}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Favorites;
