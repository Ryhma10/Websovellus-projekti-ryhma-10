import { pool } from '../helper/db.js';

export async function createFavorite({ user_id, tmdb_id }) {
  const result = await pool.query(
    'INSERT INTO user_favorites (user_id, tmdb_id) VALUES ($1, $2) RETURNING *',
    [user_id, tmdb_id]
  );
  return result.rows[0];
}

export async function getFavoritesByUser(user_id) {
    const result = await pool.query(
      'SELECT * FROM user_favorites WHERE user_id = $1',
      [user_id]
    );
    return result.rows;
}

export const getPublicFavoritesByUser = async (user_id) => {
  const result = await pool.query(
    'SELECT tmdb_id FROM user_favorites WHERE user_id = $1',
    [user_id]
  )
  return result.rows.map(row => row.tmdb_id)
}