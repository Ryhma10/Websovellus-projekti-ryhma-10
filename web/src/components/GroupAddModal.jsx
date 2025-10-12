// src/components/GroupAddModal.jsx
import { useEffect, useMemo, useState } from "react";
import "./MovieModal.css";
import placeholder from "../assets/placeholder.png";

export default function GroupAddModal({
  open,
  onClose,
  source,        // "tmdb" | "finnkino"
  movie,         // TMDB- tai Finnkino-olion data
  groupId,
  token,
  defaultNote = "",
  onSuccess,     // ({ source, id }) => void
}) {

  // ----- local state -----
  const [note, setNote] = useState(defaultNote);
  const [stars, setStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Finnkino: show/hide showtimes list (collapse)
  const [showTimesOpen, setShowTimesOpen] = useState(true);

  // Reset note/stars/toggles when modal or movie changes
  useEffect(() => {
    if (!open) return;
    setNote(defaultNote || "");
    setStars(0);
    setShowTimesOpen(true);
  }, [open, movie, defaultNote]);

  // ----- snapshot for both sources (ALWAYS fill snap_* fields) -----
  const snapshot = useMemo(() => {
    if (!movie) {
      return { title: "", overview: "", poster_url: placeholder };
    }
    if (source === "tmdb") {
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : placeholder;
      return {
        title: movie.title || movie.name || "",
        overview: movie.overview || "",
        poster_url: poster,
      };
    }
    // Finnkino
    return {
      title: movie.title || "",
      overview: movie.synopsis || movie.shortSynopsis || "", // tyhjä string ok
      poster_url: movie.posterUrl || placeholder,
    };
  }, [movie, source]);

  // ----- Finnkino showtimes normalize -----
  // Palauttaa listan:
  // [{ theatreId, theatreName, city, showtimes:[{ startsAt, auditorium }] }]
  const normalizedShowtimes = useMemo(() => {
    if (source !== "finnkino" || !movie) return [];

    // 1) jos mukana theatre-ryhmiteltynä
    if (Array.isArray(movie.theatres)) {
      return movie.theatres
        .map((th) => ({
          theatreId: String(th.theatreId ?? th.id ?? ""),
          theatreName: th.theatreName ?? th.name ?? "",
          city: th.city ?? "",
          showtimes: Array.isArray(th.showtimes)
            ? th.showtimes.map((s) => ({
                startsAt: s.startsAt || s.time || s.starts_at,
                auditorium: s.auditorium || s.screen || null,
              }))
            : [],
        }))
        .filter((t) => t.theatreName || (t.showtimes && t.showtimes.length > 0));
    }

    // 2) jos litteä lista showtimes[]
    if (Array.isArray(movie.showtimes)) {
      const byTh = new Map();
      movie.showtimes.forEach((s) => {
        const tid = String(s.theatreId ?? s.theatre_id ?? s.theatre ?? "unknown");
        if (!byTh.has(tid)) {
          byTh.set(tid, {
            theatreId: tid,
            theatreName: s.theatreName ?? s.theatre_name ?? "",
            city: s.city ?? "",
            showtimes: [],
          });
        }
        byTh.get(tid).showtimes.push({
          startsAt: s.startsAt || s.time || s.starts_at,
          auditorium: s.auditorium || s.screen || null,
        });
      });
      return Array.from(byTh.values());
    }

    // 3) fallback
    const theatreId = String(
      movie.theatreId ?? movie.raw?.TheatreID ?? movie.raw?.theatreId ?? ""
    );
    const theatreName = movie.theatre ?? movie.raw?.theatre ?? movie.raw?.Theatre ?? "";
    const city = movie.raw?.TheatreArea ?? movie.raw?.city ?? "";
    const startsAt = movie.start ?? movie.raw?.start;
    const auditorium = movie.raw?.Auditorium ?? movie.raw?.auditorium ?? null;

    if (theatreId || startsAt) {
      return [
        {
          theatreId,
          theatreName,
          city,
          showtimes: startsAt ? [{ startsAt, auditorium }] : [],
        },
      ];
    }
    return [];
  }, [source, movie]);

  // ----- selection (multi by click) -----
  // key format: `${theatreId}|${startsAt}|${auditorium || ""}`
  const keyFor = (thId, s) => `${thId}|${s.startsAt}|${s.auditorium || ""}`;

  // Kerätään kaikki mahdolliset avaimet
  const allKeys = useMemo(() => {
    const keys = [];
    normalizedShowtimes.forEach((th) => {
      (th.showtimes || []).forEach((s) => keys.push(keyFor(th.theatreId, s)));
    });
    return keys;
  }, [normalizedShowtimes]);

  const [selectedKeys, setSelectedKeys] = useState(new Set());

  // Kun modal avataan → ei valita mitään oletuksena
  useEffect(() => {
    if (!open || source !== "finnkino") return;
    setSelectedKeys(new Set());
  }, [open, source, allKeys]);

  function toggleKey(k) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  // ----- submit -----
  async function handleAdd() {
    try {
      setSubmitting(true);

      if (source === "tmdb") {
        const body = {
          tmdb_id: movie.id,
          note: note?.trim() || null,
          stars: stars || null,
          snap_title: snapshot.title,
          snap_overview: snapshot.overview, // TMDB: voi olla tyhjä string -> ok
          snap_poster_url: snapshot.poster_url,
        };

        const res = await fetch(
          `http://localhost:3001/api/group_movies/${groupId}/tmdb`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

        onSuccess?.({ source: "tmdb", id: movie.id });
        onClose();
        return;
      }

  if (source === "finnkino") {
  // --- 1) Kerää näytösajat teattereittain ---
  // Käytä normalizedShowtimes jos sellainen on, muuten normalisoi "movie" tähän muotoon.
  const theatresSrc = Array.isArray(normalizedShowtimes)
    ? normalizedShowtimes
    : (function buildFromMovie(m) {
        if (!m) return [];
        // Valmiiksi teattereittain?
        if (Array.isArray(m.theatres)) return m.theatres;
        // Litteä lista -> ryhmittele teattereittain
        if (Array.isArray(m.showtimes)) {
          const byTh = {};
          m.showtimes.forEach(s => {
            const thId = String(s.theatreId ?? s.theatre_id ?? s.theatre ?? "unknown");
            if (!byTh[thId]) {
              byTh[thId] = {
                theatreId: thId,
                theatreName: s.theatreName ?? s.theatre_name ?? "",
                city: s.city ?? "",
                showtimes: []
              };
            }
            byTh[thId].showtimes.push({
              startsAt: s.startsAt || s.time || s.starts_at,
              auditorium: s.auditorium || s.screen || null
            });
          });
          return Object.values(byTh);
        }
        return [];
      })(movie);

  // --- 2) Suodata valintojen mukaan (jos käytössä), muuten lähetä kaikki ---
  const hasSelection = typeof selectedKeys !== "undefined" && selectedKeys instanceof Set && selectedKeys.size > 0;

  // Jos sinulla on sama keyFor kuin aiemmin, käytä sitä. Muuten miniversio:
  const _keyFor = (thId, s) =>
    (typeof keyFor === "function")
      ? keyFor(thId, s)
      : `${thId}|${s.startsAt}|${s.auditorium || ""}`;

  const showtimesOut = theatresSrc
    .map(th => ({
      ...th,
      showtimes: (th.showtimes || []).filter(s =>
        !hasSelection || selectedKeys.has(_keyFor(String(th.theatreId), s))
      )
    }))
    .filter(th => (th.showtimes || []).length > 0);

  // --- 3) Rakenna body (huom: snap_overview oikein kirjoitettuna + ei-tyhjä) ---
  const body = {
    finnkino_id: movie.id,
    note: note?.trim() || null,
    stars: stars || null,
    snap_title: snapshot.title || "",
    snap_overview: (snapshot.overview && snapshot.overview.trim()) ? snapshot.overview.trim() : "-",
    snap_poster_url: snapshot.poster_url || "",
    finnkino_showtimes: showtimesOut
  };

  console.log("[GroupAddModal] POST /group_movies/finnkino body =", body);

  const res = await fetch(`http://localhost:3001/api/group_movies/${groupId}/finnkino`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  onSuccess?.({ source: "finnkino", id: movie.id });
  onClose();
  return;
}

    } catch (e) {
      alert(e.message || "Adding failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || !movie) return null;

  // ----- UI -----
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>

        <h2 className="modal-title">
          {snapshot.title}{" "}
          <span className="badge">{source === "tmdb" ? "TMDB" : "Finnkino"}</span>
        </h2>

        <div className="modal-content">
          <div className="poster-wrap">
            <img
              src={snapshot.poster_url || placeholder}
              alt={snapshot.title}
              className="modal-poster"
            />
          </div>

          {/* Overview vain TMDB:lle */}
          {source === "tmdb" && snapshot.overview && (
            <p className="movie-overview">{snapshot.overview}</p>
          )}
        </div>

        {/* tähdet */}
        <label className="stars-label" style={{ display: "block", marginTop: 12 }}>
          Stars:
          <span style={{ display: "inline-block", marginLeft: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  cursor: "pointer",
                  color: star <= stars ? "#FFD700" : "#ccc",
                  fontSize: "1.5rem",
                }}
                onClick={() => setStars(star)}
                onMouseOver={() => setStars(star)}
                onMouseOut={() => setStars(stars)}
                role="button"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </span>
            ))}
          </span>
        </label>

        {/* note */}
        <textarea
          className="review-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            source === "tmdb"
              ? "Write a message to the group…"
              : "Write a message or notes…"
          }
          maxLength={300}
          style={{ marginTop: 12 }}
        />

        {/* Finnkino showtimes chips */}
        {source === "finnkino" && normalizedShowtimes.length > 0 && (
          <div className="fk-showtimes">
            <button
              type="button"
              className="small-btn"
              onClick={() => setShowTimesOpen((v) => !v)}
              style={{ marginTop: 8 }}
            >
              {showTimesOpen ? "Hide showtimes" : "Show showtimes"}
            </button>

            {showTimesOpen && (
              <div className="fk-showtimes__list" style={{ marginTop: 8 }}>
                {normalizedShowtimes.map((th, i) => (
                  <div key={`${th.theatreId}-${i}`} className="fk-theatre">
                    <div className="fk-theatre-name">
                      {th.theatreName}
                      {th.city ? `, ${th.city}` : ""}
                    </div>

                    <div className="chips">
                      {(th.showtimes || []).map((s, j) => {
                        const k = keyFor(th.theatreId, s);
                        const active = selectedKeys.has(k);
                        return (
                          <button
                            type="button"
                            key={`${k}-${j}`}
                            className={`chip ${active ? "chip--selected" : ""}`}
                            onClick={() => toggleKey(k)}
                            title={s.auditorium || ""}
                          >
                            {new Date(s.startsAt).toLocaleString()}
                            {s.auditorium ? ` — ${s.auditorium}` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button className="modal-btn" disabled={submitting} onClick={handleAdd}>
            {submitting ? "Adding…" : "Add to group"}
          </button>
        </div>
      </div>
    </div>
  )
}
