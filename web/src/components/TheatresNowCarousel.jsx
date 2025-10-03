import React from "react";
import placeholder from "../assets/placeholder.png";
import styles from "./TheatresNowCarousel.module.css";

function TheatresNowCarousel({ movies }) {
  const [current, setCurrent] = React.useState(0); // Current movie index
  const visibleCount = 3; // Number of visible movies

  if (!movies || movies.length === 0) return null; // If no movies, render nothing

  // Calculate visible movies
  const visibleMovies = [];
  for (let i = 0; i < visibleCount; i++) {
    visibleMovies.push(movies[(current + i) % movies.length]);
  }

  return (
    <div className={styles["popular-carousel"]}>
      <h2>In Theatres Now</h2>
      <div className={styles["carousel-content"]}>
        {/* Previous button */}
        <button onClick={() => setCurrent((current - 1 + movies.length) % movies.length)}>{"<"}</button>
        {visibleMovies.map((movie, idx) => (
          <div
            className={`${styles["movie-item"]} ${
              idx === 1 ? styles["movie-item-center"] : styles["movie-item-side"]
            }`}
            key={movie.id || idx}
          >
            <img
              src={movie.image || placeholder}
              alt={movie.title}
              className={
                idx === 1
                  ? `${styles["movie-poster"]} ${styles["movie-poster-center"]}`
                  : `${styles["movie-poster"]} ${styles["movie-poster-side"]}`
              }
            />
            <div className={styles["movie-info"]}>
              {movie.title}
              <br />
            </div>
          </div>
        ))}
        {/* Next button */}
        <button onClick={() => setCurrent((current + 1) % movies.length)}>{">"}</button>
      </div>
    </div>
  );
}

export default TheatresNowCarousel;