import * as TmdbModel from '../models/TmdbModel.js';

export const searchMovies = async (req, res, next) => {
    try {
        const { query, page } = req.query;
        const data = await TmdbModel.searchMovies(query, page);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

export const getGenres = async (req, res, next) => {
    try {
        const genres = await TmdbModel.getGenres();
        res.json({ genres });
    } catch (err) {
        next(err);
    }
};

export const getPopularMovies = async (req, res, next) => {
    try {
        const movies = await TmdbModel.getPopularMovies();
        res.json(movies);
    } catch (err) {
        next(err);
    }
};
