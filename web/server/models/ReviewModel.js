import { pool } from '../helper/db.js';

export async function createReview({ user_id, tmdb_id, stars, body }) {
  const result = await pool.query(
    'INSERT INTO reviews (user_id, tmdb_id, stars, body) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, tmdb_id, stars, body]
  );
  return result.rows[0];
}

export async function getReviewsByMovie(tmdb_id) {
  const result = await pool.query(
    `SELECT reviews.*, users.username
     FROM reviews
     JOIN users ON reviews.user_id = users.id
     WHERE reviews.tmdb_id = $1`,
    [tmdb_id]
  );
  return result.rows;
}

export async function getReviewsByUser(user_id) {
  const result = await pool.query(
    'SELECT * FROM reviews WHERE user_id = $1',
    [user_id]
  );
  return result.rows;
}