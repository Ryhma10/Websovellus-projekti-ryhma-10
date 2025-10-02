import React from "react";
import placeholder from '../assets/placeholder.png';
import "./PopularCarousel.css";
import MovieModal from "./MovieModal";


//Komponentti, joka näyttää suosituimmat elokuvat karusellina
function PopularCarousel({ movies }) {
  //State: mikä elokuva on karusellin keskellä
  const [current, setCurrent] = React.useState(0);
  //Kuinka monta elokuvaa näytetään kerrallaan
  const visibleCount = 3;
  //State: mikä elokuva on valittuna
  const [selectedMovie, setSelectedMovie] = React.useState(null); // Uusi state

  //Jos elokuvia ei ole, ei näytetä mitään
  if (!movies || movies.length === 0) return null;

  //Lasketaan näkyvät elokuvat karuselliin
  const visibleMovies = [];
  for (let i = 0; i < visibleCount; i++) {
    visibleMovies.push(movies[(current + i) % movies.length]);
  }

  return (
    <div className="popular-carousel">
      <h2>Popular Now</h2>
      <div className="carousel-content">
        {/* Edellinen-nappi */}
        <button onClick={() => setCurrent((current - 1 + movies.length) % movies.length)}>{"<"}</button>
        {visibleMovies.map((movie, idx) => (
          <div
          //Keskimmäiselle elokuvalle oma luokka, jotta se erottuu
            className={`movie-item${idx === 1 ? " movie-item-center" : " movie-item-side"}`}
            key={idx}
          >
            <img
            //Näytetään elokuvan juliste
              src={movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : placeholder} //Jos ei kuvaa, näytetään placeholder
              alt={movie.title}
              //Keskimmäiselle elokuvalle oma tyyli
              className={idx === 1 ? "movie-poster movie-poster-center" : "movie-poster movie-poster-side"} //Keskimmäiselle oma tyyli
              //Klikkaus avaa modaalin
              onClick={() => setSelectedMovie(movie)}
              style={{ cursor: "pointer" }}
            />
            <div className="movie-info">{movie.title}</div>
          </div>
        ))}
        {/* Seuraava-nappi */}
        <button onClick={() => setCurrent((current + 1) % movies.length)}>{">"}</button>
      </div>
      {/* Näytä modaali kun elokuva valittu */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

export default PopularCarousel;