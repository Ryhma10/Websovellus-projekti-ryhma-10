import { Router } from "express";
import { Authentication } from "../helper/auth.js";
import * as TmdbController from "../controllers/TmdbController.js";

const router = Router();

router.get("/search", Authentication, TmdbController.searchMovies);
router.get("/genres", Authentication, TmdbController.getGenres);
router.get("/popular", Authentication, TmdbController.getPopularMovies);

export default router;
