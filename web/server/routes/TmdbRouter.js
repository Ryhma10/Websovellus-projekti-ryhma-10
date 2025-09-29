import { Router } from "express"
import * as TmdbController from "../controllers/TmdbController.js"

const router = Router();

router.get("/search", TmdbController.searchMovies);
router.get("/genres", TmdbController.getGenres);
router.get("/popular", TmdbController.getPopularMovies);

export default router;
