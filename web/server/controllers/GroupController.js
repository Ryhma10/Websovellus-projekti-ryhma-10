import {
  createGroup as createGroupModel,
  joinGroup,
  approveMembership,
  getAllGroups,
  getMyGroups,
  isOwner,
  getPendingRequestsForOwner
} from "../models/GroupModel.js";

// Luo uusi ryhmä
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const group = await createGroupModel(name, userId);
    res.status(201).json(group);
  } catch (err) {
    console.error("createGroup error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Liittymispyyntö
export const requestToJoin = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.userId;

    await joinGroup(groupId, userId);
    res.status(201).json({ message: "Join request sent" });
  } catch (err) {
    console.error("requestToJoin error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};



// Hae liittymispyynnöt ryhmän omistajalle
export const fetchPendingRequests = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const requests = await getPendingRequestsForOwner(ownerId);
    res.json(requests);
  } catch (err) {
    console.error("fetchPendingRequests error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


// Owner hyväksyy jäsenen
export const approveMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;
    const userId = req.user.userId;

    const owner = await isOwner(groupId, userId);
    if (!owner) {
      return res.status(403).json({ error: "Only the owner can approve members" });
    }

    await approveMembership(groupId, memberId);
    res.json({ message: "Member approved" });
  } catch (err) {
    console.error("approveMember error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Hae kaikki ryhmät
export const fetchAllGroups = async (req, res) => {
  try {
    const groups = await getAllGroups();
    res.json(groups);
  } catch (err) {
    console.error("fetchAllGroups error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Hae kirjautuneen käyttäjän omat ryhmät
export const fetchMyGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groups = await getMyGroups(userId);
    res.json(groups);
  } catch (err) {
    console.error("fetchMyGroups error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
