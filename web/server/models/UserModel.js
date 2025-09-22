import { pool } from "../../server/helper/db.js"; // pg pool

export async function createUser(username, email, hashedPassword) {
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [username, email, hashedPassword]
  );
  return result.rows[0];
}

export async function findByUsername(username) {
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0] || null;
}

export async function deleteById(id) {
  // Set session variable for trigger
    // Set session variable for trigger (must use string interpolation, not $1)
    await pool.query(`SET app.user_id = '${id}'`);
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0] || null;
}