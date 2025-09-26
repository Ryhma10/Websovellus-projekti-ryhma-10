import { getGenresFromTmdb, getMoviesFromTmdb, getPopularMoviesFromTmdb } from "../helper/api.js";

const ApiController = {
    fetchMovies: async (req, res) => {
        const { query, page } = req.query;
        console.log(req.query);
        try {
            const movies = await getMoviesFromTmdb(query, page);
            res.status(200).json(movies);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch movies' });
        }
    },

    fetchGenres: async (req, res) => {
        try {
            const genres = await getGenresFromTmdb();
            res.status(200).json(genres);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch genres' });
        }
    },

    fetchPopularMovies: async (req, res) => {
        try {
            const popularMovies = await getPopularMoviesFromTmdb();
            res.status(200).json(popularMovies);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch popular movies' });
        }
    }
};
export default ApiController;