import express from "express"
import { Authentication } from "../helper/auth.js"
import {
  createGroup,
  requestToJoin,
  approveMember,
  addMovie,
  fetchAllGroups,
  fetchMyGroups,
  fetchPendingRequests,
  fetchGroupDetails,
  deleteGroup,
  removeMember,
  leaveGroupController,
  rejectJoinRequest,
} from "../controllers/GroupController.js"

const router = express.Router();

// Luo uusi ryhmä (vain kirjautuneille)
router.post("/create", Authentication, createGroup)
// Lähetä liittymispyyntö
router.post("/join", Authentication, requestToJoin)
// Owner hyväksyy jäsenen
router.post("/approve", Authentication, approveMember)
// Ryhmään lisätään elokuva
router.post("/:groupId/movies", Authentication, addMovie)
// Ryhmään hakija hylätään
router.post("/reject", Authentication, rejectJoinRequest)

// Hae kaikki ryhmät
router.get("/", fetchAllGroups)
// Hae kirjautuneen käyttäjän omat ryhmät
router.get("/my", Authentication, fetchMyGroups)
// Hae liittymispyynnöt
router.get("/:groupId/requests", Authentication, fetchPendingRequests)

// Hae ryhmän tiedot
router.get("/:groupId", Authentication, fetchGroupDetails)
// Poista ryhmä
router.delete("/:groupId", Authentication, deleteGroup)
// Poista jäsen ryhmästä
router.delete("/:groupId/members/:userId", Authentication, removeMember)
// Jäsen poistaa itsensä ryhmästä
router.delete("/:groupId/members/me", Authentication, leaveGroupController)

export default router