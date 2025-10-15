//Tehtäviin liittyvät reitit

import { Router } from "express"
import { getAllMovies, getMovieById, addMovie, updateMovie, deleteMovie } from "../controllers/MovieController.js"

const router = Router()

router.get("/", getAllMovies)
router.get("/:id", getMovieById)
router.post("/", addMovie)
router.put("/:id", updateMovie)
router.delete("/:id", deleteMovie)

export default router