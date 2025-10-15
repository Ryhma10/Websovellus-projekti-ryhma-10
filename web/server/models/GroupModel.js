import { pool } from "../helper/db.js"

// Luo uusi ryhmä ja palauta group-id + nimi
export async function createGroup(name, userId) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // Luo ryhmä
    const groupRes = await client.query(
      `INSERT INTO groups (name, owner_id) 
      VALUES ($1, $2) 
      RETURNING id, name, owner_id`,
      [name, userId]
    )
    const group = groupRes.rows[0]

    // Lisää owner ja approved memberships-tauluun
    await client.query(
      `INSERT INTO group_memberships (group_id, user_id, status, role) 
       VALUES ($1, $2, 'approved', 'owner')`,
      [group.id, userId]
    )

    await client.query("COMMIT")
    return group
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

// Liittymispyyntö
export async function joinGroup(groupId, userId) {
  await pool.query(
    `INSERT INTO group_memberships (group_id, user_id, status) 
     VALUES ($1, $2, 'pending')
     ON CONFLICT (group_id, user_id) DO NOTHING`,
    [groupId, userId]
  )
}

// Owner hyväksyy jäsenen
export async function approveMembership(groupId, memberId) {
  await pool.query(
    `UPDATE group_memberships 
     SET status = 'approved', role = 'member' 
     WHERE group_id = $1 AND user_id = $2`,
    [groupId, memberId]
  )
}

// Hae kaikki ryhmät (vain perustiedot)
export async function getAllGroups() {
  const res = await pool.query(
    `SELECT g.id, g.name
     FROM groups g
     ORDER BY g.id DESC`
  )
  return res.rows
}

// Hae käyttäjän ryhmät
export async function getMyGroups(userId) {
  const res = await pool.query(
    `SELECT g.id, g.name, m.role, m.status
     FROM groups g
     JOIN group_memberships m ON g.id = m.group_id
     WHERE m.user_id = $1
     ORDER BY g.id DESC`,
    [userId]
  )
  return res.rows
}

// Tarkista, että käyttäjä on ryhmän owner
export async function isOwner(groupId, userId) {
  const res = await pool.query(
    `SELECT 1 FROM group_memberships 
     WHERE group_id = $1 AND user_id = $2 
       AND role = 'owner' AND status = 'approved'`,
    [groupId, userId]
  )
  return res.rowCount > 0
}

// Hae jäsenyys
export async function getMembership(groupId, userId) {
  const { rows } = await pool.query(
    `SELECT role, status
    FROM group_memberships
    WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  )
  return rows[0] || null
}

// Hae omistajan ryhmien liittymispyynnöt
export async function getPendingRequestsForOwner(ownerId, groupId) {
  const res = await pool.query(
    `
    SELECT gm.group_id, 
    g.name AS group_name, 
    gm.user_id, 
    u.username, 
    gm.status
    FROM group_memberships gm
    JOIN groups g ON g.id = gm.group_id
    JOIN users u ON u.id = gm.user_id
    WHERE g.owner_id = $1 AND gm.status = 'pending' AND gm.group_id =$2
    ORDER BY gm.group_id;
    `,
    [ownerId, groupId]
  )
  return res.rows
}

// Hae ryhmän tiedot näytettäväksi sivulla approved-jäsenille
export async function getGroupDetails(groupId, userId) {
  //vain hyväksytylle jäsenelle
  const m = await getMembership(groupId, userId)

  if (!m || m.status !== "approved")
    return { forbidden: true }

  const groupQ = await pool.query(
    `SELECT id, name, owner_id
    FROM groups
    WHERE id = $1`,
    [groupId]
  )

  if (!groupQ.rows[0]) return { notFound: true }

  const membersQ = await pool.query(
    `SELECT u.id, u.username, gm.role, gm.status
    FROM group_memberships gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = $1
    ORDER BY (gm.role='owner') DESC, u.username ASC`,
    [groupId]
  )

  const moviesQ = await pool.query(
    `SELECT id, tmdb_id, finnkino_id, user_id, note, stars, created_at
    FROM group_movies
    WHERE group_id = $1
    ORDER BY created_at DESC`,
    [groupId]
  )

  return {
    group: groupQ.rows[0],
    myMembership: m,
    members: membersQ.rows,
    movies: moviesQ.rows,
  }
}

// Ryhmän poisto jos on owner
export async function deleteGroupByOwner(groupId, ownerId) {
  const { rowCount } = await pool.query(
    `DELETE FROM groups
    WHERE id = $1 and owner_id = $2`,
    [groupId, ownerId]
  )
  return rowCount
}

// Owner saa poistaa jäsenen, ei itseään, silloin hän joutuu poistamaan ryhmän, kuten yllä
export async function removeMemberAsOwner(groupId, removedUserId) {
  // tarkista, ettei poistettava ole owner
  const roleQ = await pool.query(
    `SELECT role
    FROM group_memberships
    WHERE group_id = $1 AND user_id = $2`,
    [groupId, removedUserId]
  )

  const role = roleQ.rows[0]?.role
  if (!role) return { notFound: true }
  if (role === "owner") return { isOwner: true } //owneria ei poisteta

  await pool.query(
    `DELETE FROM group_memberships
    WHERE group_id= $1 AND user_id = $2`,
    [groupId, removedUserId]
  )
  return { ok: true }
}

// Owner poistaa jäsenyyttä hakevan (pending) hakemuksen (reject)
export async function rejectPendingMembership(groupId, memberId) {
  const del = await pool.query(
    `DELETE FROM group_memberships
    WHERE group_id = $1 AND user_id = $2 AND status = 'pending'`,[groupId, memberId]
  )

  if (del.rowCount === 0) {
    const chk = await pool.query(
      `SELECT status FROM group_memberships WHERE group_id = $1 AND user_id = $2`, [groupId, memberId]
    )
    if (chk.rowCount === 0) return { notFound: true}
    if (chk.rows[0].status !== 'pending') return { already: true }
  }
  return { ok: true }
}


// Jäsen poistaa itsensä ryhmästä
export async function leaveGroup(groupId, userId) {
  const m = await getMembership(groupId, userId)
  if (!m) return { notFound: true }
  if (m.role === "owner") return { ownerCannotLeave: true }

  await pool.query(
    `DELETE FROM group_memberships
    WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  )
  return { ok: true }
}

// Elokuvan lisääminen ryhmään
export async function addMovieToGroup({ groupId, userId, tmdbId, finnkinoId, note = null, stars = null }) {
  if (!tmdbId && !finnkinoId) {
    throw Object.assign(new Error("tmdbId or finnkinoId required"), { status: 400 })
  }

  //varmista jäsenyys
  const m = await getMembership(groupId, userId)
  if (!m || m.status !=="approved") {
    throw Object.assign(new Error("Group membership required"), { status: 403 })
  }

  // Tallennetaan tmdb elokuva tietokantaan
  if (tmdbId) {
    const q =
      `INSERT INTO group_movies (group_id, user_id, tmdb_id, note, stars)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ON CONSTRAINT uq_gm_tmdb DO NOTHING
      RETURNING *`
    const { rows } = await pool.query(q, [groupId, userId, tmdbId, note, stars])
    return rows[0] || null
  } else {
    const q =
      `INSERT INTO group_movies (group_id, user_id, finnkino_id, note, stars)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT uq_gm_finn DO NOTHING
      RETURNING *`
    const { rows } = await pool.query(q, [groupId, userId, finnkinoId, note, stars])
    return rows[0] || null
  }
}

