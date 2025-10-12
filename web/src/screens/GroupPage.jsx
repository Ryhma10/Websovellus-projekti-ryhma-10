// pages/GroupPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Groups.css";
import SearchBar from "../components/SearchBar.jsx";
import placeholder from "../assets/placeholder.png";
import GroupAddModal from "../components/GroupAddModal.jsx";

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Modal
  const [addModal, setAddModal] = useState({ open: false, source: null, movie: null });

  // Perustila
  const [group, setGroup] = useState(null);
  const [showFinnkino, setShowFinnkino] = useState(false);
  const [showTmdb, setShowTmdb] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [feed, setFeed] = useState([]);

  // Duplikaattien esto
  const [existing, setExisting] = useState({ finnkino: new Set(), tmdb: new Set() });

  // Finnkino
  const [fkResults, setFkResults] = useState([]);

  // TMDB
  const [movieQuery, setMovieQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [yearQuery, setYearQuery] = useState("");
  const [externalMovies, setExternalMovies] = useState([]);
  const [externalGenres, setExternalGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  // Feed
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

  // Lataa ryhmä
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

        // jo lisätyt
        const fk = new Set();
        const tm = new Set();
        (data.movies || []).forEach((m) => {
          if (m.finnkino_id) fk.add(String(m.finnkino_id));
          if (m.tmdb_id) tm.add(String(m.tmdb_id));
        });
        setExisting({ finnkino: fk, tmdb: tm });

        await reloadFeed();
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        alert("Error when loading group information");
        navigate("/groups");
      }
    })();
    return () => ctrl.abort();
  }, [groupId, token, navigate, pendingRequests]);

  // Modal open/close
  function openAddModal(source, movie) {
    setAddModal({ open: true, source, movie });
  }
  function closeAddModal() {
    setAddModal({ open: false, source: null, movie: null });
  }

  // Owner: pending-join listaus
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

  // TMDB genret
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

  // TMDB haku
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

  // Finnkino: lapselta tulokset
  const handleFinnkinoResults = useCallback((results) => {
    setFkResults(results || []);
  }, []);

  // Ryhmittele Finnkino (1 kortti / elokuva)
  const groupedFkResults = useMemo(() => {
    const byId = new Map();
    for (const s of fkResults || []) {
      const id = Number(s.id ?? s.eventId ?? s.EventID ?? s.eventID ?? s.ID);
      if (!Number.isFinite(id)) continue;

      const title = s.title || s.Title || "";
      const posterUrl = s.posterUrl || s.image || placeholder;
      const startsAt = s.start ?? s.raw?.start;

      const theatreId   = String(s.theatreId ?? s.raw?.TheatreID ?? s.raw?.theatreId ?? "");
      const theatreName = s.theatre ?? s.raw?.theatre ?? s.raw?.Theatre ?? "";
      const city        = s.raw?.TheatreArea ?? s.raw?.city ?? "";
      const auditorium  = s.raw?.Auditorium ?? s.raw?.auditorium ?? null;

      let rec = byId.get(id);
      if (!rec) {
        rec = { id, title, posterUrl, theatres: [] };
        byId.set(id, rec);
      } else if (!rec.posterUrl && posterUrl) {
        rec.posterUrl = posterUrl;
      }

      let th = rec.theatres.find(t => t.theatreId === theatreId);
      if (!th) {
        th = { theatreId, theatreName, city, showtimes: [] };
        rec.theatres.push(th);
      }
      if (startsAt) th.showtimes.push({ startsAt, auditorium });
    }
    return Array.from(byId.values());
  }, [fkResults]);

  // Apurit
  const isOwner = group?.myMembership?.role === "owner";
  const isAddedFinnkino = (id) => existing.finnkino.has(String(id));
  const isAddedTmdb = (id) => existing.tmdb.has(String(id));

  // Owner-toiminnot
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

  // Varhainen näyttö
  if (!group) return <div className="group-page">Ladataan…</div>;

  // Feed-kortti
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
          {source && <span className={`card__badge card__badge--${source.toLowerCase()}`}>{source}</span>}
        </div>
        <div>
          <div className="card__title-row">
            <h3 className="card__title">{p.snap_title}</h3>
            <span className="card__year">{new Date(p.created_at).toLocaleString()}</span>
          </div>
          {stars != null && <div className="stars">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</div>}
          {p.snap_overview && <p className="overview">{p.snap_overview}</p>}
          {p.note && <p className="note"><em>{p.note}</em></p>}
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

      {/* FEED */}
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

      {/* FINNKINO */}
      {showFinnkino && (
        <section className="group-page-search">
          <h3>Finnkino</h3>
          <SearchBar embedded onResults={handleFinnkinoResults} />

          <div className="results-grid">
            {groupedFkResults.map((m) => (
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
                    {m.theatres?.[0]?.showtimes?.[0]?.startsAt && (
                      <span className="card__year">
                        {new Date(m.theatres[0].showtimes[0].startsAt).getFullYear()}
                      </span>
                    )}
                  </div>
                  <div className="card__actions">
                    {isAddedFinnkino(m.id) ? (
                      <button className="btn" disabled>✓ Added</button>
                    ) : (
                      <button className="btn" onClick={() => openAddModal("finnkino", m)}>
                        Add to Group
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
                    <div className="card__actions">
                      {isAddedTmdb(m.id) ? (
                        <button className="btn" disabled>✓ Added</button>
                      ) : (
                        <button className="btn" onClick={() => openAddModal("tmdb", m)}>
                          Add to Group
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

      {addModal.open && (
        <GroupAddModal
          open={addModal.open}
          onClose={closeAddModal}
          source={addModal.source}
          movie={addModal.movie}
          groupId={groupId}
          token={token}
          onSuccess={({ source, id }) => {
            if (source === "tmdb") {
              setExisting(prev => ({ ...prev, tmdb: new Set(prev.tmdb).add(String(id)) }));
            } else if (source === "finnkino") {
              setExisting(prev => ({ ...prev, finnkino: new Set(prev.finnkino).add(String(id)) }));
            }
            reloadFeed();
          }}
        />
      )}
    </div>
  );
}

export default GroupPage;