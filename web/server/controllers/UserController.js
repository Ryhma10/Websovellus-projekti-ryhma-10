//Sovelluslogiikka (HTTP-pyynnöt, tietokantakyselyt jne.). Import { hash, compare } from "bcrypt";

import jwt from "jsonwebtoken"
import { createUser, findByUsername, deleteById, findById } from "../models/UserModel.js"
import { hash, compare } from "bcrypt"

//tehdään validointiapuri, domain koostuu labeleista, välissä vähintään yksi piste. i lopussa = case-insensitive
const EMAIL_RE = /^[^\s@]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i

//salasanassa vähintään 8 merkkiä, vähintään 1 iso kirjain ja yksi numero
const PASS_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/

//siivousapuri
const clean = (v) => String(v ?? "").trim();

//tehdään viive epäonnistuneisiin signin pyyntöihin, auttaa botteja vastaan
const sleep = (baseMs = 250, jitterMs = 250) =>
  new Promise(resolve => setTimeout(resolve, baseMs + Math.floor(Math.random() * jitterMs)))

export const signup = async (req, res, next) => {
  try {
    //console.log("Request body:", req.body); // See what data arrives
    //const { email, password, username } = req.body;
    const username = clean(req.body.username)
    const email = clean(req.body.email).toLowerCase()
    const password = String(req.body.password ?? "")

    if (!username || !email || !password) {
      //return next(new Error("Email and password are required"));
      return res.status(400).json({ error: "Username, email and password are required"})
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Invalid email"})
    }
    if (!PASS_RE.test(password)) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters long and include at least one uppercase letter and one digit"})
    }

    const hashedPassword = await hash(password, 10);
    
    let newUser;
    try {
      newUser = await createUser(username, email, hashedPassword)
    } catch (err) {
      if (err?.code === "23505") {
        return res.status(409).json({ error: "Account identifier already in use"})
      }
      throw err
    }

    return res.status(201).json({ 
      id: newUser.id, 
      email: newUser.email,
      username: newUser.username
    });
  } catch (err) {
    //console.error(err); //tarkistetaan error
    return next(err);
  }
}

export const signin = async (req, res, next) => {
  try {
    const username = clean(req.body.username)
    const password = String(req.body.password ?? "")
    //console.log("Signin request body:", req.body); // Debuggaus

    if (!username || !password) {
      await sleep() //200-500 ms viive
      return res.status(400).json({ error: "Username and password are required"})
    }

    const dbUser = await findByUsername(username);
    if (!dbUser) {
      await sleep() //200-500 ms viive
      return res.status(401).json({ error: "Invalid credentials"});
    }

    const isMatch = await compare(password, dbUser.password_hash);
    if (!isMatch) {
      await sleep() //200-500 ms viive
      return res.status(401).json({ error: "Invalid credentials"})
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(500).json({ error: "JWT secret not configured"})
    }

    const token = jwt.sign(
      { userId: dbUser.id, username: dbUser.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    )

    res.status(200).json({
      id: dbUser.id,
      email: dbUser.email,
      token,
    })

  } catch (err) {
    return next(err)
  }
}

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user?.userId //vaatii auth-middlewarea
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" })
    }
    await deleteById(userId)
    res.status(200).json({ message: "Account deleted." })
  } catch (err) {
    return next(err)
  }
}

export const getUsernameById = async (req, res, next) => {
  try {
    const user = await findById(req.params.userId)
    if (!user) {
      return res.status(404).json({error: "User not found"})
    }
    res.json({username: user.username})
  } catch (err) {
    console.error("getUsernameById error:", err.message);
    next(err);
  }
}

