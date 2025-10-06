import {
  createGroup as createGroupModel,
  joinGroup,
  approveMembership,
  getAllGroups,
  getMyGroups,
  isOwner as isOwnerModel,
  getPendingRequestsForOwner,
  getGroupDetails as getGroupDetailsModel,
  deleteGroupByOwner,
  removeMemberAsOwner,
  leaveGroup,
  addMovieToGroup 
} from "../models/GroupModel.js"

// Luo uusi ryhmä
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body
    const userId = req.user.userId

    if (!name) {
      return res.status(400).json({ error: "Group name is required" })
    }

    const group = await createGroupModel(name, userId)
    res.status(201).json(group)
  } catch (err) {
    console.error("createGroup error:", err.message)
    res.status(500).json({ error: "Server error" })
  }
}

// Liittymispyyntö
export const requestToJoin = async (req, res) => {
  try {
    const { groupId } = req.body
    const userId = req.user.userId

    await joinGroup(groupId, userId)
    res.status(201).json({ message: "Join request sent" })
  } catch (err) {
    console.error("requestToJoin error:", err.message)
    res.status(500).json({ error: "Server error" })
  }
}

// Owner hyväksyy jäsenen
export const approveMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.body
    const userId = req.user.userId

    const owner = await isOwnerModel(groupId, userId)
    if (!owner) {
      return res.status(403).json({ error: "Only the owner can approve members" })
    }

    await approveMembership(Number(groupId), Number (memberId))
    res.json({ message: "Member approved" })
  } catch (err) {
    console.error("approveMember error:", err.message)
    res.status(500).json({ error: "Server error" })
  }
}

// Hae kaikki ryhmät
export const fetchAllGroups = async (req, res) => {
  try {
    const groups = await getAllGroups()
    res.json(groups)
  } catch (err) {
    console.error("fetchAllGroups error:", err.message)
    res.status(500).json({ error: "Server error" })
  }
}

// Hae kirjautuneen käyttäjän omat ryhmät
export const fetchMyGroups = async (req, res) => {
  try {
    const userId = req.user.userId
    const groups = await getMyGroups(userId)
    res.json(groups)
  } catch (err) {
    console.error("fetchMyGroups error:", err.message)
    res.status(500).json({ error: "Server error" })
  }
}

// Hae liittymispyynnöt ryhmän omistajalle
export const fetchPendingRequests = async (req, res) => {
  try {
    const ownerId = req.user.userId
    const requests = await getPendingRequestsForOwner(ownerId)
    res.json(requests)
  } catch (err) {
    console.error("fetchPendingRequests error:", err.message)
    res.status(500).json({ error: "Server error" })
  }
}

// Hae kaikki liittymispyynnöt ryhmälle (vain owner)
/*export async function fetchJoinRequests(req, res) {
  try {
    const groupId = req.params.groupId
    const userId = req.user.userId
    // Tarkista että käyttäjä on owner
    const isOwner = await req.app.locals.GroupModel.isOwner(groupId, userId)
    if (!isOwner) {
      return res.status(403).json({ error: "Forbidden" })
    }
    // Hae kaikki pending-jäsenyydet
    const result = await req.app.locals.pool.query(
      `SELECT m.user_id, u.username
       FROM group_memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.group_id = $1 AND m.status = 'pending'`,
      [groupId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
}*/

// Hae ryhmän tiedot
export async function fetchGroupDetails(req, res) {
  try {
    const groupId = Number(req.params.groupId)
    const userId = req.user.userId

    const data = await getGroupDetailsModel(groupId, userId)
    if (data.forbidden) return res.status(403).json({ error: "Group membership required"})
    if (data.notFound) return res.status(404).json({ error: "Group not found"})

    return res.json({
      id: data.group.id,
      name: data.group.name,
      ownerId: data.group.owner_id,
      myMembership: data.myMembership, //{ role, status }
      members: data.members, // [{ id, username, role, status }]
      movies: data.movies // [{ id, tmdb_id, finnkino_id...}]
    })
  } catch (err) {
    console.error("fetchGroupDetails error", err)
    return res.status(500).json({ error: "Server error"})
  }
}

// Poista ryhmä
export async function deleteGroup(req, res) {
  try {
    const groupId = Number(req.params.groupId)
    const actingUserId = req.user.userId

    const owner = await isOwnerModel(groupId, actingUserId)
    if (!owner) return res.status(403).json({ error: "Only the owner can delete the group"})

    const rc = await deleteGroupByOwner(groupId, actingUserId)
    if (rc === 0) return res.status(403).json({ error: "Only the owner can delete the group"})

    return res.status(204).send()
  } catch (err) {
    console.error("deleteGroup error", err)
    return res.status(500).json({ error: "Server error"})
  }
}

// Poista käyttäjä ryhmästä
export async function removeMember(req, res) {
  try {
    const groupId = Number(req.params.groupId)
    const removedUserId = Number(req.params.userId) //tämä on users.id
    const actingUserId = req.user.userId //owner, joka tekee poistopyynnön

    const owner = await isOwnerModel(groupId, actingUserId)
    if (!owner) return res.status(403).json({ error: "Owner role required"})
    
    const r = await removeMemberAsOwner(groupId, removedUserId)
    if (r.notFound) return res.status(404).json({ error: "Membership not found" })
    if (r.isOwner) return res.status(409).json({ error: "Can not remove the owner"})

    return res.status(204).send()
  } catch (err) {
    console.error("removeMember error", err)
    return res.status(500).json({ error: "Server error"})
  }
}

// Tarkistetaan saako lähteä ryhmästä (owner ei saa)
export async function leaveGroupController(req, res) {
  try {
    const groupId = Number(req.params.groupId)
    const userId = req.user.userId
    
    const r = await leaveGroup(groupId, userId)
    if (r.ownerCantLeave) return res.status(409).json({ error: "Owner can not leave: delete the group instead"})
    if (r.notFound) return res.status(404).json({ error: "Membership not found"})

    return res.status(204).send()
  } catch (err) {
    console.error("leaveGroup error", err)
    return res.status(500).json({ error: "Server error"})
  }
}

// Lisätään elokuva ryhmäsivulle
export async function addMovie(req, res) {
  try {
    const groupId = Number(req.params.groupId)
    const userId = req.user.userId
    const { tmdbId, finnkinoId, note, stars } = req.body

    const row = await addMovieToGroup({ groupId, userId, tmdbId, finnkinoId, note, stars})
    if (!row) return res.status(409).json({ error: "Allready added"})
    
      return res.status(201).json(row)
  } catch (err) {
    const status = err.status || 500
    return res.status(status).json({ error: err.message || "Server error"})
  }
}