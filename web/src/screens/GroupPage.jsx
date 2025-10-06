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
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        alert("Error when loading group information");
        navigate("/groups");
      }
    })();
    return () => ctrl.abort();
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
  }, [group, token]);

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

  // --- lisää Finnkino ---
  async function addFinnkinoToGroup(movie) {
    const key = `finnkino:${movie.id}`;
    setAdding((prev) => new Set(prev).add(key));
    try {
      const body = { finnkinoId: movie.id, note: fkNotes[movie.id]?.trim() || null };
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 || res.status === 409) {
        setExisting((prev) => ({ ...prev, finnkino: new Set(prev.finnkino).add(String(movie.id)) }));
      } else {
        alert(data.error || "Adding failed");
      }
    } finally {
      setAdding((prev) => { const n = new Set(prev); n.delete(key); return n; });
    }
  }

  // --- lisää TMDB ---
  async function addTmdbToGroup(movie) {
    const key = `tmdb:${movie.id}`;
    setAdding((prev) => new Set(prev).add(key));
    try {
      const body = { tmdbId: movie.id, note: tmdbNotes[movie.id]?.trim() || null };
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 || res.status === 409) {
        setExisting((prev) => ({ ...prev, tmdb: new Set(prev.tmdb).add(String(movie.id)) }));
      } else {
        alert(data.error || "Adding failed");
      }
    } finally {
      setAdding((prev) => { const n = new Set(prev); n.delete(key); return n; });
    }
  }

  // --- varhainen näyttö vasta hookkien jälkeen ---
  if (!group) return <div className="group-page">Ladataan…</div>;

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
