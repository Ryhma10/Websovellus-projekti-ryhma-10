// src/components/GroupAddModal.jsx
import { useEffect, useMemo, useState } from "react"
import "./MovieModal.css"
import placeholder from "../assets/placeholder.png"

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
  const [note, setNote] = useState(defaultNote)
  const [stars, setStars] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showTimesOpen, setShowTimesOpen] = useState(true)

  useEffect(() => {
    if (!open) return
    setNote(defaultNote || "")
    setStars(0)
    setShowTimesOpen(true)
  }, [open, movie, defaultNote])

 // snapshotit TMDB ja Finnkino
  const snapshot = useMemo(() => {
    if (!movie) return { title: "", overview: "", poster_url: placeholder }

    if (source === "tmdb") {
      const title = movie.title || movie.name || ""
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : placeholder;
      const overview = String(
        movie.overview ||
        movie.description ||
        movie.plot ||
        ""
      ).trim()

      return { title, overview, poster_url: poster }
    }

    // FINNKINO (ei fkDetails-lookupia)
    const m = movie || {}
    const poster =
      m.posterUrl || m.PosterURL || m.images?.poster ||
      m.raw?.Images?.EventLargeImagePortrait || m.raw?.image ||
      m.raw?.Event?.Images?.EventLargeImagePortrait ||
      placeholder

    const title =
      m.title || m.Title || m.raw?.Title || m.raw?.Event?.Title || ""

    // Finnkinolla ei kuvausta
    const overview = ""

    return { title, overview, poster_url: poster }
  }, [movie, source])

  // Näytösajat
  const normalizedShowtimes = useMemo(() => {
    if (source !== "finnkino" || !movie) return []

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
        .filter((t) => t.theatreName || (t.showtimes && t.showtimes.length > 0))
    }

    if (Array.isArray(movie.showtimes)) {
      const byTh = new Map();
      movie.showtimes.forEach((s) => {
        const tid = String(s.theatreId ?? s.theatre_id ?? s.theatre ?? "unknown")
        if (!byTh.has(tid)) {
          byTh.set(tid, {
            theatreId: tid,
            theatreName: s.theatreName ?? s.theatre_name ?? "",
            city: s.city ?? "",
            showtimes: [],
          })
        }
        byTh.get(tid).showtimes.push({
          startsAt: s.startsAt || s.time || s.starts_at,
          auditorium: s.auditorium || s.screen || null,
        })
      })
      return Array.from(byTh.values())
    }

    const theatreId = String(
      movie.theatreId ?? movie.raw?.TheatreID ?? movie.raw?.theatreId ?? ""
    );
    const theatreName = movie.theatre ?? movie.raw?.theatre ?? movie.raw?.Theatre ?? ""
    const city = movie.raw?.TheatreArea ?? movie.raw?.city ?? ""
    const startsAt = movie.start ?? movie.raw?.start
    const auditorium = movie.raw?.Auditorium ?? movie.raw?.auditorium ?? null

    if (theatreId || startsAt) {
      return [{
        theatreId, theatreName, city,
        showtimes: startsAt ? [{ startsAt, auditorium }] : [],
      }]
    }
    return [];
  }, [source, movie])

  const keyFor = (thId, s) => `${thId}|${s.startsAt}|${s.auditorium || ""}`

  const [selectedKeys, setSelectedKeys] = useState(new Set())
  useEffect(() => {
    if (!open || source !== "finnkino") return
    setSelectedKeys(new Set())
  }, [open, source, normalizedShowtimes])

  function toggleKey(k) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  async function handleAdd() {
    try {
      setSubmitting(true)

      if (source === "tmdb") {
        const body = {
          tmdb_id: movie.id,
          note: note?.trim() || null,
          stars: stars || null,
          snap_title: snapshot.title,
          snap_overview: snapshot.overview || "-", // ei overview’ta
          snap_poster_url: snapshot.poster_url,
        }
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
        )
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
        if (typeof onSuccess === "function") onSuccess({ source: "tmdb", id: movie.id })
        onClose && onClose()
        return
      }

      // FINNKINO
      const hasSelection = selectedKeys.size > 0
      const showtimesOut = normalizedShowtimes
        .map(th => ({
          ...th,
          showtimes: (th.showtimes || []).filter(s =>
            !hasSelection || selectedKeys.has(keyFor(String(th.theatreId), s))
          )
        }))
        .filter(th => (th.showtimes || []).length > 0)

      const body = {
        finnkino_id: movie.id,
        note: note?.trim() || null,
        stars: stars || null,
        snap_title: snapshot.title || "",
        snap_overview: "-", // ei overview’ta
        snap_poster_url: snapshot.poster_url || "",
        finnkino_showtimes: showtimesOut
      }

      const res = await fetch(`http://localhost:3001/api/group_movies/${groupId}/finnkino`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      })
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      if (typeof onSuccess === "function") onSuccess({ source: "finnkino", id: movie.id })
      onClose && onClose()
    } catch (e) {
      alert(e.message || "Adding failed")
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || !movie) return null

  return (
    <div className="modal-backdrop modal-backdrop--high" onClick={onClose}>
      <div className="movie-modal movie-modal--groupadd" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>

        <div className="modal-scroll">
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

          {snapshot.overview && (
            <div className="desc-right">
              <p className="movie-overview">{snapshot.overview}</p>
            </div>
          )}
        </div>

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

          <textarea
            className="review-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={source === "tmdb" ? "Write a message to the group…" : "Write a message or notes…"}
            maxLength={300}
            style={{ marginTop: 12 }}
          />

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
                          )
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
    </div>
  )
}
