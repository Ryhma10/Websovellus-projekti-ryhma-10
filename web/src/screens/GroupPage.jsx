// pages/GroupPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Groups.css";
import SearchBar from "../components/SearchBar.jsx";

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [group, setGroup] = useState(null);
  const [showFinnkino, setShowFinnkino] = useState(false);

  // Finnkino tulokset + lisäystila + jo lisättyjen id-setti
  const [fkResults, setFkResults] = useState([]);
  const [adding, setAdding] = useState(new Set());
  const [existing, setExisting] = useState({ finnkino: new Set(), tmdb: new Set() });

  // ---- Ryhmän tiedot ----
  async function load(signal) {
    try {
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal
      });
      if (res.status === 403 || res.status === 404) {
        alert("Not authorized, or group not found");
        navigate("/groups");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setGroup(data);

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
  }

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [groupId, token, navigate]);

  if (!group) return <div className="group-page">Ladataan...</div>;

  const isOwner = group.myMembership?.role === "owner";

  // ---- Owner poistaa ryhmän ----
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

  // ---- Owner poistaa jäsenen ----
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

  // ---- Jäsen poistuu itse ----
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

  // ---- SearchBar → tulokset GroupPagelle ----
  function handleFinnkinoResults(results) {
    // results tulee muodossa [{ id, title, posterUrl, year?, raw... }]
    setFkResults(results || []);
  }

  // ---- Lisää Finnkino-leffa ryhmään ----
  async function addFinnkinoToGroup(movie) {
    const key = `finnkino:${movie.id}`;
    setAdding(prev => new Set(prev).add(key));
    try {
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ finnkinoId: movie.id })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 || res.status === 409) {
        setExisting(prev => ({
          ...prev,
          finnkino: new Set(prev.finnkino).add(String(movie.id))
        }));
      } else {
        alert(data.error || "Adding failed");
      }
    } finally {
      setAdding(prev => { const n = new Set(prev); n.delete(key); return n; });
    }
  }

  const isAdded = (id) => existing.finnkino.has(String(id));
  const isAdding = (id) => adding.has(`finnkino:${id}`);

  return (
    <div className="group-page">
      <div className="group-page-header">
        <h2 className="group-page-title">This is group {group.name}</h2>

        <div className="group-page-actions">
          <button className="btn" onClick={() => setShowFinnkino(v => !v)}>
            {showFinnkino ? "Hide Finnkino search" : "Search from Finnkino"}
          </button>
          {isOwner ? (
            <button className="btn deleting-btn" onClick={onDeleteGroup}>Delete this group</button>
          ) : (
            <button className="btn leavegroup-btn" onClick={onLeaveGroup}>Leave this group</button>
          )}
        </div>
      </div>

      <section className="members">
        <h3>Members</h3>
        <ul className="members-list">
          {group.members?.map((m) => (
            <li key={m.id} className="members-item">
              <span>
                {m.username} {m.role === "owner" ? "Owner" : ""}
              </span>
              {isOwner && m.role !== "owner" && (
                <button className="small-btn" onClick={() => onRemoveMember(m.id)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {showFinnkino && (
        <section className="group-page-search">
          {/* ⬇️ upotettu SearchBar: EI piirrä omaa listaansa, vaan palauttaa tulokset */}
          <SearchBar embedded onResults={handleFinnkinoResults} />

          {/* ⬇️ GroupPage näyttää kortit ja lisää-napit */}
          <div className="results-grid" style={{ marginTop: "1rem" }}>
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
                  <div className="card__actions">
                    {isAdded(m.id) ? (
                      <button className="btn" disabled>✓ Added</button>
                    ) : (
                      <button
                        className="btn"
                        disabled={isAdding(m.id)}
                        onClick={() => addFinnkinoToGroup(m)}
                      >
                        {isAdding(m.id) ? "Adding…" : "Add to group"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default GroupPage;
