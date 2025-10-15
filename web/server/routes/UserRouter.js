//Käyttäjäreitit
import { Router } from "express"
import * as userController from "../controllers/UserController.js"
import { Authentication } from "../helper/auth.js"
import { signinLimiter, signupLimiter } from "../helper/rateLimiters.js"
 
const router = Router()

router.post("/signup", signupLimiter, userController.signup) //ei tarvitse authia signuppiin, signupLimiter estää bottihyökkäyksiä
router.post("/signin", signinLimiter, userController.signin) //ei tarvitse authia signinniin, tuottaa itse todennuksen
router.post("/logout", Authentication, (req, res) => {
  res.status(200).json({ message: "Logout successful" })
}) //Logout ei tee mitään backendissä, mutta auth tarvitaan
router.delete("/delete", Authentication, userController.deleteAccount) //delete tarvitsee authin
router.get("/public/:userId", userController.getUsernameById)
router.put("/profile-picture", Authentication, userController.uploadProfilePicture)
router.get("/profile-picture", Authentication, userController.getProfilePicture)

export default router