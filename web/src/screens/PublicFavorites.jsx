import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './PublicFavorites.css';

function PublicFavorites() {
  const { userId } = useParams();
  const [tmdbIds, setTmdbIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchPublicFavorites = async () => {
        try {
            const favRes = await fetch(`http://localhost:3001/api/favorites/public/${userId}`)
            if (!favRes.ok) {
                throw new Error("Failed to fetch public favorites")
            }
            const favData = await favRes.json();
            setTmdbIds(favData);
            
            const userRes = await fetch(`http://localhost:3001/api/users/public/${userId}`)
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
  }, [userId]);

  return (
    <div>
      <h2 className="public-title">{username ? `${username}'s Favorites` : "User's Favorites"}</h2>
      {loading ? (
        <p className="public-info">Loading...</p>
      ) : tmdbIds.length === 0 ? (
        <p className="public-info">No public favorites found.</p>
      ) : (
        <ul>
          {tmdbIds.map(id => (
            <li className="public-items" key={id}>
                <img
                src={id.poster_path
                  ? `https://image.tmdb.org/t/p/w200${id.poster_path}`
                  : "/placeholder.png"}
                alt={id.title}
              />
              <h3>{id.title}</h3>
              <p>{id.overview}</p>
                </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PublicFavorites;