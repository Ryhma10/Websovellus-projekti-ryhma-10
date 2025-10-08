import React from "react";

export default function MoviePostCard({ post }) {
  const {
    username,
    created_at,
    snap_title,
    snap_overview,
    snap_poster_url,
    note,
    stars,
    finnkino_showtimes,
    tmdb_id,
    finnkino_id
  } = post;

  const source = tmdb_id ? "TMDB" : (finnkino_id ? "Finnkino" : "");

  return (
    <article className="movie-card">
      <header className="movie-card__header">
        <div className="movie-card__meta">
          <strong>{username}</strong>
          <span> • {new Date(created_at).toLocaleString()}</span>
        </div>
        {source && <span className="badge">{source}</span>}
      </header>

      <div className="movie-card__body">
        {snap_poster_url && (
          <img className="movie-card__poster" src={snap_poster_url} alt={snap_title} />
        )}
        <div className="movie-card__content">
          <h3>{snap_title}</h3>
          {Number.isInteger(stars) && (
            <div className="stars">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</div>
          )}
          {snap_overview && <p className="overview">{snap_overview}</p>}
          {note && <p className="note"><em>{note}</em></p>}

          {Array.isArray(finnkino_showtimes) && finnkino_showtimes.length > 0 && (
            <div className="showtimes">
              <h4>Näytösajat</h4>
              <ul>
                {finnkino_showtimes.map((th, i) => (
                  <li key={i}>
                    <strong>{th.theatreName}</strong>{th.city ? `, ${th.city}` : ""}
                    <ul>
                      {(th.showtimes || []).map((s, j) => (
                        <li key={j}>
                          {new Date(s.startsAt).toLocaleString()}
                          {s.auditorium ? ` — ${s.auditorium}` : ""}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
