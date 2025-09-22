//Sovelluslogiikka (HTTP-pyynnöt, tietokantakyselyt jne.)import { hash, compare } from "bcrypt";

import jwt from "jsonwebtoken";
import { createUser, findByUsername, deleteById } from "../models/UserModel.js";
import { hash, compare } from "bcrypt";

export const signup = async (req, res, next) => {
  try {
    console.log("Request body:", req.body); // See what data arrives
    const { email, password, username } = req.body;
    if (!username || !email || !password) {
      return next(new Error("Email and password are required"));
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await createUser(username, email, hashedPassword);

    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (err) {
    console.error(err); // See the error in your backend terminal
    next(err);
  }
}

export const signin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log("Signin request body:", req.body); // Debug line
    if (!username || !password) {
      return next(new Error("Username and password are required"));
    }

    const dbUser = await findByUsername(username);
    if (!dbUser) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    const isMatch = await compare(password, dbUser.password_hash);
    if (!isMatch) {
      const error = new Error("Invalid password");
      error.status = 401;
      return next(error);
    }

    const token = jwt.sign(
      { userId: dbUser.id, username: dbUser.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      id: dbUser.id,
      email: dbUser.email,
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId; // get userId from JWT payload
    if (!userId) {
      return res.status(400).json({ message: "User ID missing in token." });
    }
    await deleteById(userId);
    res.status(200).json({ message: "Account deleted." });
  } catch (err) {
    next(err);
  }
};

