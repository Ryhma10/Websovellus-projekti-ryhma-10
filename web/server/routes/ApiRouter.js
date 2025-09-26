import { Router } from "express";
import { Authentication } from "../helper/auth.js";
import ApiController from "../controllers/ApiController.js";

const router = Router();

router.get("/", Authentication , ApiController.fetchMovies);
router.get("/genres", Authentication , ApiController.fetchGenres);
router.get("/popular", Authentication , ApiController.fetchPopularMovies);

export default router;
