//Käyttäjäreitit
import { Router } from "express";
import * as userController from "../controllers/UserController.js";
import { Authentication } from "../helper/auth.js";
 
const router = Router();
 

router.post("/signup", userController.signup); // No auth for signup
router.post("/signin", userController.signin); // No auth for signin
router.delete("/delete", Authentication, userController.deleteAccount); // Auth for delete

export default router;