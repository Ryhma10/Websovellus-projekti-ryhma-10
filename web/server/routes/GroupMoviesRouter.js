import express from "express"
import { Authentication } from "../helper/auth.js"
import {
  postTMDB,
  postFinnkino,
  getFeed,
} from "../controllers/GroupMoviesController.js"

const router = express.Router()

/**
 * Lisää tai päivitä TMDB-pohjainen postaus ryhmään
 * Body: { tmdb_id, note, stars, snap_title, snap_overview, snap_poster_url }
 */
router.post("/:groupId/tmdb", Authentication, postTMDB)

/**
 * Lisää tai päivitä Finnkino-pohjainen postaus ryhmään
 * Body: { finnkino_id, note, stars, snap_title, snap_overview, snap_poster_url, finnkino_showtimes }
 *  - finnkino_showtimes: JSON-string (tai objekti; kontrolli hoitaa molemmat)
 */
router.post("/:groupId/finnkino", Authentication, postFinnkino)

/**
 * Hae ryhmän feed (TMDB + Finnkino samassa muodossa)
 */
router.get("/:groupId/feed", Authentication, getFeed)

export default router
