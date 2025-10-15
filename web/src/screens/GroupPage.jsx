// pages/GroupPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./GroupPage.css"
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
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/group_movies/${groupId}/feed`, {
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
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}`, {
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
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/requests`, {
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
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tmdb/genres`, {
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
          `${import.meta.env.VITE_API_URL}/api/tmdb/search?query=${encodeURIComponent(movieQuery)}&page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        let results = data.results || [];
        setPageCount(data.total_pages || 1);

        if (genreQuery) results = results.filter((m) => m.genre_ids?.includes(Number(genreQuery)));
        if (yearQuery) results = results.filter((m) => m.release_date?.startsWith(yearQuery));
        setExternalMovies(results);
      } catch (err) {
        console.error("TMDB fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [showTmdb, movieQuery, genreQuery, yearQuery, page, token]);

  // Finnkino: haetaaan callbackilla lapselta tulokset
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

      const theatreId = String(s.theatreId ?? s.raw?.TheatreID ?? s.raw?.theatreId ?? "");
      const theatreName = s.theatre ?? s.raw?.theatre ?? s.raw?.Theatre ?? "";
      const city = s.raw?.TheatreArea ?? s.raw?.city ?? "";
      const auditorium = s.raw?.Auditorium ?? s.raw?.auditorium ?? null;

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

  const approvedMembers = React.useMemo(() => {
  const list = Array.isArray(group?.members) ? group.members : [];
  return list.filter((m) => {
    // yritetään lukea mahdollisia status-kenttiä; fallback roolin perusteella
    const raw = (m.status ?? m.membership_status ?? m.state ?? "").toString().toLowerCase();
    if (raw) return raw === "approved" || raw === "active";
    if (typeof m.approved === "boolean") return m.approved === true;
    // jos backendi ei lähetä statusta lainkaan, jäsenellä on rooli vasta hyväksynnän jälkeen
    return m.role === "owner" || m.role === "member";
  });
}, [group?.members]);

  // Owner-toiminnot
  async function handleApprove(groupIdArg, memberId) {
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/approve`, {
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

  async function handleReject(groupIdArg, memberId) {
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId: groupIdArg, memberId }),
      });
      const msg = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(msg.error || `Reject failed (${res.status})`);

      setPendingRequests((prev) =>
        prev.filter((r) => !(r.group_id === groupIdArg && r.user_id === memberId))
      );
      alert("Join request rejected");
    } catch (e) {
      alert(e.message);
    }
  }

  async function onDeleteGroup() {
    if (!window.confirm(`Delete the group "${group.name}"?`)) return;
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}`, {
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
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/members/${userId}`, {
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
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/members/me`, {
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

  // Postaus-kortti (vaakasuuntainen)
  function PostCard({ p }) {
    const title =
      (p.snap_title && p.snap_title.trim()) ||
      (p.tmdb_id ? `TMDB #${p.tmdb_id}` : p.finnkino_id ? `Finnkino #${p.finnkino_id}` : "Untitled");

    const poster = p.snap_poster_url || placeholder;
    const stars = Number.isInteger(p.stars) ? p.stars : null;

    // dd.mm.yyyy HH:MM
    function fmtDateTime(iso) {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
    }

    const username = (p.username || `user#${p.user_id}`).replace(/^@/, "");

    return (
      <article className="post-card">
        <div className="post-card__poster">
          {poster ? <img src={poster} alt={title} /> : null}
        </div>

        <div className="post-card__body">
          {/* Otsikko + tähdet */}
          <div className="post-card__title-row">
            <h3 className="post-card__title">{title}</h3>
            {stars != null && (
              <div className="post-card__stars" aria-label={`${stars} / 5`}>
                <span className="stars--filled">{"★".repeat(stars)}</span>
                <span className="stars--empty">{"☆".repeat(5 - stars)}</span>
              </div>
            )}
          </div>

          {/* Meta: näkyvä tekijä + aikaleima */}
          <div className="post-card__meta">
            <span className="author__name">@{username}</span>
            <span className="post-card__timestamp">{fmtDateTime(p.created_at)}</span>
          </div>

          {/* Teksti + näytösajat */}
          <div className="post-card__content">
            {p.note ? <p className="post-card__note">{p.note}</p> : null}

            {Array.isArray(p.finnkino_showtimes) && p.finnkino_showtimes.length > 0 && (
              <div className="post-card__showtimes">
                {p.finnkino_showtimes.map((th, i) => (
                  <div className="showtime-row" key={`${th.theatreId || i}-${i}`}>
                    <div className="showtime-row__left">
                      {th.theatreName ? <strong>{th.theatreName}</strong> : null}
                      {th.city ? <span>• {th.city}</span> : null}
                      {th.auditorium ? <span>• {th.auditorium}</span> : null}
                    </div>
                    <div className="showtime-row__right">
                      {Array.isArray(th.showtimes) && th.showtimes.length > 0
                        ? fmtDateTime(th.showtimes[0].startsAt)
                        : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
  <div className="group-page">
   {/* Otsikko erikseen, isona */}
    <header className="group-topbar">
      <h2 className="group-page-title">{group.name}</h2>
    </header>

    {/* Keskitetty työkalurivi: Search + Delete/Leave samalle riville */}
    <div className="group-toolbar">
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

    {/* FINNKINO – tulokset nappien alle */}
    {showFinnkino && (
      <section className="group-page-search">
        <h3>Finnkino</h3>
        <SearchBar embedded onResults={handleFinnkinoResults} />

        <ul className="movie-results">
          {groupedFkResults.map((m) => (
            <li
              className="movie-item"
              key={`finnkino:${m.id}`}
              onClick={() => openAddModal("finnkino", m)}
            >
              <div className="poster-box">
                <img
                  className={m.posterUrl ? "movie-poster" : "placeholder-image"}
                  src={m.posterUrl || placeholder}
                  alt={m.title}
                />
              </div>
              <div className="movie-info">{m.title}</div>
            </li>
          ))}
        </ul>
      </section>
    )}

    {/* TMDB – tulokset nappien alle */}
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
            value={genreQuery}
            onChange={(e) => setGenreQuery(e.target.value)}
          >
            <option value="">Genre</option>
            {externalGenres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select
            className="year-select-tmdb"
            value={yearQuery}
            onChange={(e) => setYearQuery(e.target.value)}
          >
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

        <ul className="movie-results">
          {externalMovies.map((m) => {
            const poster = m.poster_path
              ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
              : placeholder;
            const cls = m.poster_path ? "movie-poster" : "placeholder-image"
            return (
              <li
                className="movie-item"
                key={`tmdb:${m.id}`}
                onClick={() => openAddModal("tmdb", m)}
              >
                <div className="poster-box">
                  <img className={cls} src={poster} alt={m.title} />
                </div>
                <div className="movie-info">{m.title}</div>
              </li>
            )
          })}
        </ul>
      </section>
    )}

    {/* Members – owner näkee Remove-napin */}
    <section className="members">
      <h3>Members</h3>
      <ul className="members-list">
        {approvedMembers.length > 0 ? (
          approvedMembers.map((m) => (
            <li className="members-item" key={m.id}>
              <div>
                <strong>{m.username}</strong>
                {m.role ? <span className="members-role">({m.role})</span> : null}
              </div>
              {isOwner && m.role !== "owner" && (
                <button
                  className="small-btn"
                  onClick={() => onRemoveMember(m.id)}
                  title="Remove member"
                >
                  Remove
                </button>
              )}
            </li>
          ))
        ) : (
          <li className="members-item"><em>No members yet</em></li>
        )}
      </ul>
    </section>

    {/* Pending Join Requests – vain ownerille */}
    {isOwner && (
      <section className="members pending-requests">
        <h3>Pending Join Requests</h3>
        <ul className="members-list">
          {pendingRequests.length === 0 ? (
            <li className="members-item"><em>No pending requests.</em></li>
          ) : (
            pendingRequests.map((req) => (
              <li className="members-item" key={`${req.group_id}-${req.user_id}`}>
                <div>
                  <strong>{req.username}</strong>
                </div>
                <div className="request-actions">
                  <button
                    className="small-btn"
                    onClick={() => handleApprove(req.group_id, req.user_id)}
                  >
                    Approve
                  </button>
                  <button
                    className="small-btn reject"
                    onClick={() => handleReject(req.group_id, req.user_id)}
                    title="Reject request"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    )}

    {/* Postaukset */}
    <section className="group-feed" style={{ marginTop: "1rem" }}>
      <h3>Posts</h3>
      {feed.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        <div className="posts-list">
          {feed.map((p) => <PostCard key={p.id} p={p} />)}
        </div>
      )}
    </section>

    {/* Add-to-group modal */}
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
            setExisting(prev => ({ ...prev, tmdb: new Set(prev.tmdb).add(String(id)) }))
          } else if (source === "finnkino") {
            setExisting(prev => ({ ...prev, finnkino: new Set(prev.finnkino).add(String(id)) }))
          }
          reloadFeed();
          }}
      />
      )}
  </div>
)
}

export default GroupPage