import React, { useEffect, useState } from "react";
import placeholder from '../assets/placeholder.png';
import "./PopularCarousel.css"

//Finnkinon In Theatres Now -karuselli
const TheatresNowCarousel = () => {
    //Tilat elokuville, lataukselle, virheille ja karusellin nykyiselle indeksille
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [current, setCurrent] = useState(0); // Karusellin keskimmäinen elokuva
    const visibleCount = 3; // Kuinka monta elokuvaa näkyy kerrallaan

    //Hae Finnkinon näytökset XML:stä
    useEffect(() => {
        fetch('https://www.finnkino.fi/xml/Schedule/?area=1002')
            .then(res => res.text())
            .then(xmlStr => {
                //Parsitaan XML-data DOMParserilla
                const parser = new window.DOMParser();
                const xml = parser.parseFromString(xmlStr, "text/xml");
                const shows = Array.from(xml.getElementsByTagName("Show"));
                //Muodostetaan elokuva-objektit
                setMovies(shows.map(show => ({
                    id: show.getElementsByTagName("ID")[0]?.textContent,
                    title: show.getElementsByTagName("Title")[0]?.textContent,
                    //theatre: show.getElementsByTagName("Theatre")[0]?.textContent, // Jos halutaan näyttää teatteri
                    //start: show.getElementsByTagName("dttmShowStart")[0]?.textContent, // Jos halutaan näyttää elokuvan alkuaika
                    image: show.getElementsByTagName("EventMediumImagePortrait")[0]?.textContent 
                })));
                setLoading(false);
            })
            .catch(err => {
                setError("Virhe haettaessa Finnkinon tietoja");
                setLoading(false);
            });
    }, []);
    //Näytetään lataus- ja virheviestit
    if (loading) return <div>Loading Finnkino Movies...</div>;
    if (error) return <div>{error}</div>;
    if (!movies || movies.length === 0) return <div>No Showtimes Found.</div>;

    // Karusellin näkyvät elokuvat
    const visibleMovies = [];
    for (let i = 0; i < visibleCount; i++) {
        visibleMovies.push(movies[(current + i) % movies.length]);
    }

    return (
        <div className="popular-carousel">
            <h2 className="carousel-title">In Theatres Now</h2>
            <div className="carousel-content">
                <button onClick={() => setCurrent((current - 1 + movies.length) % movies.length)}>{"<"}</button>
                {visibleMovies.map((movie, idx) => (
                    <div
                        className={`movie-item${idx === 1 ? " movie-item-center" : " movie-item-side"}`}
                        key={movie.id || idx}
                    >
                        <img
                            src={movie.image || placeholder}
                            alt={movie.title}
                            className={idx === 1 ? "movie-poster movie-poster-center" : "movie-poster movie-poster-side"}
                        />
                        <div className="movie-info">
                            {movie.title}<br />
                            <span style={{ fontSize: '0.9em', color: '#888' }}>{movie.theatre}</span><br />
                            <span style={{ fontSize: '0.85em' }}>{movie.start}</span>
                        </div>
                    </div>
                ))}
                <button onClick={() => setCurrent((current + 1) % movies.length)}>{">"}</button>
            </div>
        </div>
    );
};

export default TheatresNowCarousel;