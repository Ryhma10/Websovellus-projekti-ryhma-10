import { Router } from "express";
import { Authentication } from "../helper/auth.js";
import * as favoritesController from "../controllers/FavoritesController.js";

const router = Router();

router.post("/", Authentication, favoritesController.addFavorite);
router.get("/", Authentication, favoritesController.getFavoritesByUser);

export default router;