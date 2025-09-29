import express from "express";
import { Authentication } from "../helper/auth.js";
import {
  createGroup,
  requestToJoin,
  approveMember,
  fetchAllGroups,
  fetchMyGroups
} from "../controllers/GroupController.js";

const router = express.Router();

// Luo uusi ryhmä (vain kirjautuneille)
router.post("/create", Authentication, createGroup);

// Lähetä liittymispyyntö
router.post("/join", Authentication, requestToJoin);

// Owner hyväksyy jäsenen
router.post("/approve", Authentication, approveMember);

// Hae kaikki ryhmät
router.get("/", Authentication, fetchAllGroups);

// Hae kirjautuneen käyttäjän omat ryhmät
router.get("/my", Authentication, fetchMyGroups);

export default router;
