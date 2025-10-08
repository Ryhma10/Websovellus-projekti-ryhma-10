import { pool } from "../helper/db.js";

const FEED_SELECT = `
  SELECT
    gm.id,
    gm.created_at,
    gm.user_id,
    u.username,
    gm.tmdb_id,
    gm.finnkino_id,
    gm.snap_title,
    gm.snap_overview,
    gm.snap_poster_url,
    gm.note,
    gm.stars,
    gm.finnkino_showtimes
  FROM group_movies gm
  JOIN users u ON u.id = gm.user_id
`;

export async function addOrUpdateTMDBPost({ groupId, userId, tmdb_id, note, stars, snap }) {
  const q = `
    INSERT INTO group_movies (
      group_id, user_id, tmdb_id, note, stars,
      snap_title, snap_overview, snap_poster_url, finnkino_showtimes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NULL)
    ON CONFLICT ON CONSTRAINT uq_gm_tmdb DO UPDATE
    SET note = EXCLUDED.note,
        stars = EXCLUDED.stars,
        snap_title = EXCLUDED.snap_title,
        snap_overview = EXCLUDED.snap_overview,
        snap_poster_url = EXCLUDED.snap_poster_url
    RETURNING *;
  `;
  const params = [
    groupId,
    userId,
    tmdb_id,
    note ?? null,
    stars ?? null,
    snap.title,
    snap.overview,
    snap.poster_url
  ];
  const { rows } = await pool.query(q, params);
  return rows[0];
}

export async function addOrUpdateFinnkinoPost({ groupId, userId, finnkino_id, note, stars, snap, showtimesJsonString }) {
  const q = `
    INSERT INTO group_movies (
      group_id, user_id, finnkino_id, note, stars,
      snap_title, snap_overview, snap_poster_url, finnkino_showtimes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, to_jsonb($9::json))
    ON CONFLICT ON CONSTRAINT uq_gm_finn DO UPDATE
    SET note = EXCLUDED.note,
        stars = EXCLUDED.stars,
        snap_title = EXCLUDED.snap_title,
        snap_overview = EXCLUDED.snap_overview,
        snap_poster_url = EXCLUDED.snap_poster_url,
        finnkino_showtimes = EXCLUDED.finnkino_showtimes
    RETURNING *;
  `;
  const params = [
    groupId,
    userId,
    finnkino_id,
    note ?? null,
    stars ?? null,
    snap.title,
    snap.overview,
    snap.poster_url,
    showtimesJsonString
  ];
  const { rows } = await pool.query(q, params);
  return rows[0];
}

export async function getGroupFeed(groupId) {
  const q = `
    ${FEED_SELECT}
    WHERE gm.group_id = $1
    ORDER BY gm.created_at DESC;
  `;
  const { rows } = await pool.query(q, [groupId]);
  return rows;
}
