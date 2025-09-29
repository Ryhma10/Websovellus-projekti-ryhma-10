import { pool } from "../helper/db.js";

// Luo uusi ryhmä ja palauta group-id + nimi
export async function createGroup(name, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Luo ryhmä
    const groupRes = await client.query(
      "INSERT INTO groups (name) VALUES ($1) RETURNING id, name",
      [name]
    );
    const group = groupRes.rows[0];

    // Lisää owner memberships-tauluun
    await client.query(
      `INSERT INTO group_memberships (group_id, user_id, status, role) 
       VALUES ($1, $2, 'approved', 'owner')`,
      [group.id, userId]
    );

    await client.query("COMMIT");
    return group;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Liittymispyyntö
export async function joinGroup(groupId, userId) {
  await pool.query(
    `INSERT INTO group_memberships (group_id, user_id, status) 
     VALUES ($1, $2, 'pending')
     ON CONFLICT (group_id, user_id) DO NOTHING`,
    [groupId, userId]
  );
}

// Owner hyväksyy jäsenen
export async function approveMembership(groupId, memberId) {
  await pool.query(
    `UPDATE group_memberships 
     SET status = 'approved', role = 'member' 
     WHERE group_id = $1 AND user_id = $2`,
    [groupId, memberId]
  );
}

// Hae kaikki ryhmät (vain perustiedot)
export async function getAllGroups() {
  const res = await pool.query(
    `SELECT g.id, g.name
     FROM groups g
     ORDER BY g.id DESC`
  );
  return res.rows;
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
  );
  return res.rows;
}

// Tarkista, että käyttäjä on ryhmän owner
export async function isOwner(groupId, userId) {
  const res = await pool.query(
    `SELECT 1 FROM group_memberships 
     WHERE group_id = $1 AND user_id = $2 
       AND role = 'owner' AND status = 'approved'`,
    [groupId, userId]
  );
  return res.rowCount > 0;
}
