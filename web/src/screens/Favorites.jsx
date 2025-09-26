import { useEffect, useState } from "react";
import './Favorites.css';

function Favorites() {
  const [movies, setMovies] = useState([]);

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

  return (
    <div>
      <h2 className="favorites-title">Your Favorites</h2>
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
