import { pool } from "../../server/helper/db.js" // pg pool

export async function createUser(username, email, hashedPassword) {
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [username, email, hashedPassword]
  )
  return result.rows[0]
}

export async function findByUsername(username) {
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  )
  return result.rows[0] || null
}

export async function findById(user_id) {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [user_id]
  )
  return result.rows[0] || null
}

//poistaa kirjautuneen käyttäjän tilin turvallisesti transaktiossa:
//asettaa app.user_id vain operaation ajaksi (set_config(..., true)) ja tekee DELETE:n 
//samassa transaktiossa, jotta users_delete_guard sallii poiston.
export async function deleteById(id) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query(
      "SELECT set_config('app.user_id', $1::text, true)",
      [String(id)]
    )
    const result = await client.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
    )
    await client.query("COMMIT")
    return result.rows[0] || null
  } catch (err) {
    try { await client.query("ROLLBACK") } catch {}
    throw err
  } finally {
    client.release()
  }
}

export async function addProfilePicture(userId, pictureUrl) {
  const result = await pool.query(
    "UPDATE users SET profile_picture_url = $1 WHERE id = $2 RETURNING *",
    [pictureUrl, userId]
  )
  return result.rows[0] || null
}

export async function getProfilePictureById(userId) {
  const result = await pool.query(
    "SELECT profile_picture_url FROM users WHERE id = $1",
    [userId]
  )
  return result.rows[0] || null
}