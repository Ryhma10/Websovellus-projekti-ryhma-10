import * as favoritesModel from '../models/FavoritesModel.js'

export const addFavorite = async (req, res, next) => {
  try {
    const user_id = req.user.userId // JWT
    const { tmdb_id } = req.body
    const favorite = await favoritesModel.addFavorite({ user_id, tmdb_id })
    res.status(201).json(favorite)
  } catch (err) {
    next(err)
  }
}

export const getFavoritesByUser = async (req, res, next) => {
    try {
        const user_id = req.user.userId;
        const favorites = await favoritesModel.getFavoritesByUser(user_id);

        const movies = await Promise.all(
            favorites.map(async fav => {
                return await getMoviesFromTmdb(fav.tmdb_id);
            })
        )

        res.status(200).json(movies)
    } catch (err) {
        console.error("getFavortiesByUse error:", err)
        next(err)
    }
}