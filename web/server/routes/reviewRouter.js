import { Router } from "express"
import { Authentication } from "../helper/auth.js"
import * as reviewController from "../controllers/ReviewController.js"

const router = Router()

router.post("/", Authentication, reviewController.createReview)
router.get("/movie/:tmdb_id", reviewController.getReviewsByMovie)
router.get("/user", Authentication, reviewController.getReviewsByUser)
router.get("/", reviewController.getAllReviews)

export default router