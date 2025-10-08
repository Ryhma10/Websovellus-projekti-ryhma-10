// pages/GroupPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Groups.css";
import SearchBar from "../components/SearchBar.jsx";
import placeholder from "../assets/placeholder.png";

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- State (kaikki ylhäällä) ---
  const [group, setGroup] = useState(null);

  const [showFinnkino, setShowFinnkino] = useState(false);
  const [showTmdb, setShowTmdb] = useState(false);

  const [pendingRequests, setPendingRequests] = useState([]);

  // jo lisätyt (duplikaattien esto UI:ssa)
  const [existing, setExisting] = useState({ finnkino: new Set(), tmdb: new Set() });
  const [adding, setAdding] = useState(new Set());

  // ---- UUTTA: ryhmän feed (postaukset) ----
  const [feed, setFeed] = useState([]);

  // Finnkino
  const [fkResults, setFkResults] = useState([]);
  const [fkNotes, setFkNotes] = useState({}); // { [id]: note }

  // TMDB
  const [movieQuery, setMovieQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [yearQuery, setYearQuery] = useState("");
  const [externalMovies, setExternalMovies] = useState([]);
  const [externalGenres, setExternalGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tmdbNotes, setTmdbNotes] = useState({}); // { [id]: note }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  // ---- apu: hae feed ----
  async function reloadFeed() {
    try {
      const res = await fetch(`http://localhost:3001/api/group_movies/${groupId}/feed`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFeed(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading feed:", err);
    }
  }

  // --- Lataa ryhmän tiedot ---
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: ctrl.signal
        });
        if (res.status === 403 || res.status === 404) {
          alert("Not authorized, or group not found");
          navigate("/groups");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setGroup(data);

        // rakenna setit valmiiksi UI:lle
        const fk = new Set();
        const tm = new Set();
        (data.movies || []).forEach((m) => {
          if (m.finnkino_id) fk.add(String(m.finnkino_id));
          if (m.tmdb_id) tm.add(String(m.tmdb_id));
        });
        setExisting({ finnkino: fk, tmdb: tm });

        // hae feed
        reloadFeed();
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        alert("Error when loading group information");
        navigate("/groups");
      }
    })();
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, token, navigate]);

  // --- Owner: pending join -pyynnöt (haetaan kun ryhmä ladattu ja käyttäjä on owner) ---
  useEffect(() => {
    if (!group || group.myMembership?.role !== "owner") return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/groups/${groupId}/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setPendingRequests(data);
      } catch (err) {
        console.error("Error fetching pending requests:", err);
      }
    })();
  }, [group, token, groupId]);

  // --- TMDB: genret (kun TMDB-välilehti on avattu) ---
  useEffect(() => {
    if (!showTmdb) return;
    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/tmdb/genres", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setExternalGenres(data.genres || []);
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    })();
  }, [showTmdb, token]);

  // --- TMDB: haku ---
  useEffect(() => {
    if (!showTmdb) return;
    const timeout = setTimeout(async () => {
      if (movieQuery.trim() === "") {
        setExternalMovies([]);
        setPageCount(1);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3001/api/tmdb/search?query=${encodeURIComponent(movieQuery)}&page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        let results = data.results || [];
        setPageCount(data.total_pages || 1);

        if (genreQuery) results = results.filter((m) => m.genre_ids?.includes(Number(genreQuery)));
        if (yearQuery)  results = results.filter((m) => m.release_date?.startsWith(yearQuery));
        setExternalMovies(results);
      } catch (err) {
        console.error("TMDB fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [showTmdb, movieQuery, genreQuery, yearQuery, page, token]);

  // --- Stable callback Finnkino-tuloksille (estä turhat re-renderit) ---
  const handleFinnkinoResults = useCallback((results) => {
    setFkResults(results || []);
  }, []);

  // --- apufunktiot ---
  const isOwner = group?.myMembership?.role === "owner";

  const isAddedFinnkino = (id) => existing.finnkino.has(String(id));
  const isAddingFinnkino = (id) => adding.has(`finnkino:${id}`);
  const isAddedTmdb = (id) => existing.tmdb.has(String(id));
  const isAddingTmdb = (id) => adding.has(`tmdb:${id}`);

  // --- owner: hyväksy jäsen ---
  async function handleApprove(groupIdArg, memberId) {
    try {
      const res = await fetch("http://localhost:3001/api/groups/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId: groupIdArg, memberId }),
      });
      const msg = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(msg.error || "Hyväksyntä epäonnistui");
      setPendingRequests((prev) =>
        prev.filter((r) => !(r.group_id === groupIdArg && r.user_id === memberId))
      );
      alert("Member approved!");
    } catch (e) {
      alert(e.message);
    }
  }

  // --- owner: poista ryhmä ---
  async function onDeleteGroup() {
    if (!window.confirm(`Delete the group "${group.name}"?`)) return;
    const res = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 204) {
      alert("Group deleted");
      navigate("/groups");
    } else {
      const msg = await res.json().catch(() => ({}));
      alert(msg.error || "Error deleting the group");
    }
  }

  // --- owner: poista jäsen ---
  async function onRemoveMember(userId) {
    if (!window.confirm("Remove member from the group?")) return;
    const res = await fetch(`http://localhost:3001/api/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 204) {
      setGroup((g) => ({ ...g, members: g.members.filter((m) => m.id !== userId) }));
    } else {
      const msg = await res.json().catch(() => ({}));
      alert(msg.error || "Operation failed");
    }
  }

  // --- jäsen: poistu ryhmästä itse ---
  async function onLeaveGroup() {
    if (!window.confirm("Do you want to leave the group?")) return;
    const res = await fetch(`http://localhost:3001/api/groups/${groupId}/members/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 204) {
      alert("You left the group");
      navigate("/groups");
    } else {
      const msg = await res.json().catch(() => ({}));
      alert(msg.error || "Error leaving the group");
    }
  }

  // ---- apu: TMDB snapshot ----
  function tmdbSnapshot(movie) {
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : placeholder;
    return {
      title: movie.title || movie.name || "",
      overview: movie.overview || "",
      poster_url: poster
    };
  }

  // ---- apu: rakenna Finnkino-showtimes JSON ----
  // Hyväksyy useita muotoja:
  //  - movie.showtimes = [{startsAt, auditorium, theatreId, theatreName, city}, ...]
  //  - movie.theatres = [{theatreId, theatreName, city, showtimes:[...]}]
  //  - movie.schedules tms. -> pyritään normalisoimaan
  function buildFinnkinoShowtimes(movie) {
    // 1) jos on jo teattereittain ryhmitelty
    if (Array.isArray(movie.theatres)) {
      return movie.theatres.map(th => ({
        theatreId: String(th.theatreId ?? th.id ?? ""),
        theatreName: th.theatreName ?? th.name ?? "",
        city: th.city ?? "",
        showtimes: Array.isArray(th.showtimes) ? th.showtimes.map(s => ({
          startsAt: s.startsAt || s.time || s.starts_at,
          auditorium: s.auditorium || s.screen || null
        })) : []
      })).filter(x => x.theatreName || (x.showtimes && x.showtimes.length));
    }

    // 2) jos on litteä showtimes-lista
    if (Array.isArray(movie.showtimes)) {
      const byTheatre = {};
      movie.showtimes.forEach(s => {
        const tid = String(s.theatreId ?? s.theatre_id ?? s.theatre ?? "unknown");
        if (!byTheatre[tid]) {
          byTheatre[tid] = {
            theatreId: tid,
            theatreName: s.theatreName ?? s.theatre_name ?? "",
            city: s.city ?? "",
            showtimes: []
          };
        }
        byTheatre[tid].showtimes.push({
          startsAt: s.startsAt || s.time || s.starts_at,
          auditorium: s.auditorium || s.screen || null
        });
      });
      return Object.values(byTheatre);
    }

    // 3) fallback: ei näytöksiä
    return [];
  }

  // --- lisää Finnkino (UUSI: käyttää /api/group-movies) ---
  async function addFinnkinoToGroup(movie) {
    const key = `finnkino:${movie.id}`;
    setAdding((prev) => new Set(prev).add(key));
    try {
      const note = fkNotes[movie.id]?.trim() || null;
      const snapshot = {
        title: movie.title || "",
        overview: movie.synopsis || movie.shortSynopsis || "",
        poster_url: movie.posterUrl || placeholder
      };
      const showtimes = buildFinnkinoShowtimes(movie);

      const body = {
        finnkino_id: movie.id,
        note,
        stars: null, // jos haluat tähdet UI:sta, välitä arvo tähän
        snap_title: snapshot.title,
        snap_overview: snapshot.overview,
        snap_poster_url: snapshot.poster_url,
        finnkino_showtimes: JSON.stringify(showtimes) // kontrolleri hyväksyy myös objektin
      };

      const res = await fetch(`http://localhost:3001/api/group_movies/${groupId}/finnkino`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // merkitse duplikaattiestoon
        setExisting((prev) => ({ ...prev, finnkino: new Set(prev.finnkino).add(String(movie.id)) }));
        // päivitä feed
        await reloadFeed();
      } else {
        alert(data.error || "Adding failed");
      }
    } catch (e) {
      console.error(e);
      alert("Adding failed");
    } finally {
      setAdding((prev) => { const n = new Set(prev); n.delete(key); return n; });
    }
  }

  // --- lisää TMDB (UUSI: käyttää /api/group-movies) ---
  async function addTmdbToGroup(movie) {
    const key = `tmdb:${movie.id}`;
    setAdding((prev) => new Set(prev).add(key));
    try {
      const note = tmdbNotes[movie.id]?.trim() || null;
      const snap = tmdbSnapshot(movie);

      const body = {
        tmdb_id: movie.id,
        note,
        stars: null, // jos lisäät tähdet UI:sta, välitä tähän
        snap_title: snap.title,
        snap_overview: snap.overview,
        snap_poster_url: snap.poster_url
      };

      const res = await fetch(`http://localhost:3001/api/group_movies/${groupId}/tmdb`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // merkitse duplikaattiestoon
        setExisting((prev) => ({ ...prev, tmdb: new Set(prev.tmdb).add(String(movie.id)) }));
        // päivitä feed
        await reloadFeed();
      } else {
        alert(data.error || "Adding failed");
      }
    } catch (e) {
      console.error(e);
      alert("Adding failed");
    } finally {
      setAdding((prev) => { const n = new Set(prev); n.delete(key); return n; });
    }
  }

  // --- varhainen näyttö vasta hookkien jälkeen ---
  if (!group) return <div className="group-page">Ladataan…</div>;

  // ---- apu: renderöi yksi post-kortti feediin ----
  function PostCard({ p }) {
    const source = p.tmdb_id ? "TMDB" : (p.finnkino_id ? "Finnkino" : "");
    const poster = p.snap_poster_url || placeholder;
    const stars = Number.isInteger(p.stars) ? p.stars : null;

    return (
      <div className="card">
        <div className="card__poster-wrap">
          {poster
            ? <img src={poster} alt={p.snap_title} className="card__poster" />
            : <div className="card__poster-fallback">{p.snap_title?.[0] || "?"}</div>}
          {source && (
            <span className={`card__badge card__badge--${source.toLowerCase()}`}>
              {source}
            </span>
          )}
        </div>
        <div>
          <div className="card__title-row">
            <h3 className="card__title">{p.snap_title}</h3>
            <span className="card__year">{new Date(p.created_at).toLocaleString()}</span>
          </div>

          {stars != null && (
            <div className="stars">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</div>
          )}

          {p.snap_overview && <p className="overview">{p.snap_overview}</p>}
          {p.note && <p className="note"><em>{p.note}</em></p>}

          {/* Finnkino-näytösajat */}
          {Array.isArray(p.finnkino_showtimes) && p.finnkino_showtimes.length > 0 && (
            <div className="showtimes">
              <h4>Näytösajat</h4>
              <ul>
                {p.finnkino_showtimes.map((th, i) => (
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
    );
  }

  return (
    <div className="group-page">
      <div className="group-page__header">
        <h2 className="group-page__title">{group.name}</h2>
        <div className="group-page__actions">
          <button className="btn" onClick={() => setShowFinnkino(v => !v)}>
            {showFinnkino ? "Hide Finnkino search" : "Search from Finnkino"}
          </button>
          <button className="btn" onClick={() => setShowTmdb(v => !v)}>
            {showTmdb ? "Hide TMDB search" : "Search from TMDB"}
          </button>
          {isOwner ? (
            <button className="btn deleting-btn" onClick={onDeleteGroup}>Delete this group</button>
          ) : (
            <button className="btn leavegroup-btn" onClick={onLeaveGroup}>Leave this group</button>
          )}
        </div>
      </div>

      {/* FEED: ryhmän postaukset */}
      <section className="group-feed">
        <h3>Posts</h3>
        {feed.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <div className="results-grid">
            {feed.map((p) => <PostCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      {/* Owner pending requests */}
      {isOwner && pendingRequests.length > 0 && (
        <section className="pending-requests">
          <h3>Pending Join Requests</h3>
          <ul>
            {pendingRequests.map((req) => (
              <li key={`${req.group_id}-${req.user_id}`}>
                <strong>{req.username}</strong> → <em>{req.group_name}</em>
                <button className="small-btn" onClick={() => handleApprove(req.group_id, req.user_id)}>
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Jäsenet */}
      <section className="members">
        <h3>Members</h3>
        <ul className="members-list">
          {group.members?.map((m) => (
            <li key={m.id} className="members-item">
              <span>
                {m.username} {m.role === "owner" ? "👑" : ""}
              </span>
              {isOwner && m.role !== "owner" && (
                <button className="small-btn" onClick={() => onRemoveMember(m.id)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* FINNKINO */}
      {showFinnkino && (
        <section className="group-page-search">
          <h3>Finnkino</h3>
          <SearchBar onResults={handleFinnkinoResults} />

          <div className="results-grid">
            {fkResults.map((m) => (
              <div key={`finnkino:${m.id}`} className="card">
                <div className="card__poster-wrap">
                  {m.posterUrl
                    ? <img src={m.posterUrl} alt={m.title} className="card__poster" />
                    : <div className="card__poster-fallback">{m.title?.[0] || "?"}</div>}
                  <span className="card__badge card__badge--finnkino">Finnkino</span>
                </div>
                <div>
                  <div className="card__title-row">
                    <h3 className="card__title">{m.title}</h3>
                    {m.year ? <span className="card__year">{m.year}</span> : null}
                  </div>

                  {!isAddedFinnkino(m.id) && (
                    <input
                      className="card__note"
                      placeholder="Optional note…"
                      value={fkNotes[m.id] || ""}
                      onChange={(e) =>
                        setFkNotes((prev) => ({ ...prev, [m.id]: e.target.value }))
                      }
                    />
                  )}

                  <div className="card__actions">
                    {isAddedFinnkino(m.id) ? (
                      <button className="btn" disabled>✓ Added</button>
                    ) : (
                      <button
                        className="btn"
                        disabled={isAddingFinnkino(m.id)}
                        onClick={() => addFinnkinoToGroup(m)}
                      >
                        {isAddingFinnkino(m.id) ? "Adding…" : "Add to group"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TMDB */}
      {showTmdb && (
        <section className="group-page-search">
          <h3>TMDB</h3>

          <div className="tmdb-search-controls">
            <input
              type="text"
              placeholder="Search movies…"
              value={movieQuery}
              onChange={(e) => { setPage(1); setMovieQuery(e.target.value); }}
            />
            <select 
              className="genre-select-tmdb"
              value={genreQuery} onChange={(e) => setGenreQuery(e.target.value)}>
              <option value="">Genre</option>
              {externalGenres.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <select 
              className="year-select-tmdb"
              value={yearQuery} onChange={(e) => setYearQuery(e.target.value)}>
              <option value="">Year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {loading && <p>Haetaan elokuvia…</p>}

          {pageCount > 1 && (
            <div className="pager">
              <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>‹ Prev</button>
              <span className="pager__info">{page} / {pageCount}</span>
              <button className="btn" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>Next ›</button>
            </div>
          )}

          <div className="results-grid">
            {externalMovies.map((m) => {
              const poster = m.poster_path
                ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
                : placeholder;
              return (
                <div key={`tmdb:${m.id}`} className="card">
                  <div className="card__poster-wrap">
                    <img src={poster} alt={m.title} className="card__poster" />
                    <span className="card__badge card__badge--tmdb">TMDB</span>
                  </div>
                  <div>
                    <div className="card__title-row">
                      <h3 className="card__title">{m.title}</h3>
                      {m.release_date ? <span className="card__year">{m.release_date.slice(0,4)}</span> : null}
                    </div>

                    {!isAddedTmdb(m.id) && (
                      <input
                        className="card__note"
                        placeholder="Optional note…"
                        value={tmdbNotes[m.id] || ""}
                        onChange={(e) =>
                          setTmdbNotes((prev) => ({ ...prev, [m.id]: e.target.value }))
                        }
                      />
                    )}

                    <div className="card__actions">
                      {isAddedTmdb(m.id) ? (
                        <button className="btn" disabled>✓ Added</button>
                      ) : (
                        <button
                          className="btn"
                          disabled={isAddingTmdb(m.id)}
                          onClick={() => addTmdbToGroup(m)}
                        >
                          {isAddingTmdb(m.id) ? "Adding…" : "Add to group"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default GroupPage;
