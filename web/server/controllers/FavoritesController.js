import * as favoritesModel from "../models/FavoritesModel.js";
import { getMovieByIdFromTmdb } from "../helper/tmdb.js";

export const addFavorite = async (req, res, next) => {
  try {
    const user_id = req.user.userId; // JWT:stä
    const { tmdb_id } = req.body;

    if (!tmdb_id) {
      return res.status(400).json({ message: "tmdb_id is required" });
    }

    const favorite = await favoritesModel.createFavorite({ user_id, tmdb_id });
    const movie = await getMovieByIdFromTmdb(favorite.tmdb_id);

    res.status(201).json(movie);
  } catch (err) {
    console.error("addFavorite error:", err.message);
    next(err);
  }
};

export const getFavoritesByUser = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const favorites = await favoritesModel.getFavoritesByUser(user_id);

    const movies = await Promise.all(
      favorites.map(fav => getMovieByIdFromTmdb(fav.tmdb_id))
    );

    res.status(200).json(movies);
  } catch (err) {
    console.error("getFavoritesByUser error:", err.message);
    next(err);
  }
};
