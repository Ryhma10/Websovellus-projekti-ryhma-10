import { Router } from "express";
import { Authentication } from "../helper/auth.js";
import ApiController from "../controllers/ApiController.js";

const router = Router();

router.get("/", ApiController.fetchMovies);
router.get("/genres", ApiController.fetchGenres);
router.get("/popular" , ApiController.fetchPopularMovies);

export default router;
