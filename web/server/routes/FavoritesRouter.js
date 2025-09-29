import { Router } from "express";
import { Authentication } from "../helper/auth.js";
import * as favoritesController from "../controllers/FavoritesController.js";

const router = Router();

router.post("/", Authentication, favoritesController.createFavorite);
router.get("/", Authentication, favoritesController.getFavoritesByUser);
router.get("/public/:userId", favoritesController.getPublicFavorites);

export default router;
