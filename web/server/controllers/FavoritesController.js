import * as favoritesModel from "../models/FavoritesModel.js"
import { getMovieByIdFromTmdb } from "../helper/tmdb.js"

export const createFavorite = async (req, res, next) => {
  try {
    const user_id = req.user.userId // JWT:stä
    const { tmdb_id } = req.body

    if (!tmdb_id) {
      return res.status(400).json({ message: "tmdb_id is required" })
    }

    await favoritesModel.createFavorite({ user_id, tmdb_id })
    res.status(201).json({ message: "Added to favorites" })
  } catch (err) {
    if (err.code === '23505') { // Postgres duplicate key error
      res.status(409).json({ error: "Already in favorites" })
    } else {
      res.status(500).json({ error: "Server error" })
    }
  }
};

export const getFavoritesByUser = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const favorites = await favoritesModel.getFavoritesByUser(user_id)

    const movies = await Promise.all(
      favorites.map(fav => getMovieByIdFromTmdb(fav.tmdb_id))
    )

    res.status(200).json(movies)
  } catch (err) {
    console.error("getFavoritesByUser error:", err.message)
    next(err)
  }
}

export const getPublicFavorites = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const tmdbIds = await favoritesModel.getPublicFavoritesByUser(userId)

    //Haetaan elokuvan tiedot jokaiselle tmdb_id:lle käyttäen tmdb.js helperiä
    const movies = await Promise.all(
      tmdbIds.map(id => getMovieByIdFromTmdb(id))
    )

    res.status(200).json(movies)
  } catch (err) {
    console.error("getPublicFavorites error:", err.message)
    next(err)
  }
}
