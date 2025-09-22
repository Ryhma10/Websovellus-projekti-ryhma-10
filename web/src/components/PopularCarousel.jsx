import React from "react";
import placeholder from '../assets/placeholder.png';
import "./PopularCarousel.css";

function PopularCarousel({ movies }) {
  const [current, setCurrent] = React.useState(0); //Karusellin keskimmäinen elokuva
  const visibleCount = 3; //Kuinka monta elokuvaa näkyy kerrallaan

  if (!movies || movies.length === 0) return null; //Jos ei elokuvia, ei näytetä mitään

  //Lasketaan näkyvät elokuvat
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
            className={`movie-item${idx === 1 ? " movie-item-center" : " movie-item-side"}`} //Keskimmäiselle oma luokka
            key={idx}
          >
            <img
              src={movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : placeholder} //Jos ei kuvaa, näytetään placeholder
              alt={movie.title}
              className={idx === 1 ? "movie-poster movie-poster-center" : "movie-poster movie-poster-side"} //Keskimmäiselle oma tyyli
            />
            <div className="movie-info">{movie.title}</div>
          </div>
        ))}
        {/* Seuraava-nappi */}
        <button onClick={() => setCurrent((current + 1) % movies.length)}>{">"}</button>
      </div>
    </div>
  );
}

export default PopularCarousel;