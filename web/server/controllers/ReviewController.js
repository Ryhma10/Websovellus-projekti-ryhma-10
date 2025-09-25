import * as reviewModel from '../models/ReviewModel.js';

export const createReview = async (req, res, next) => {
  try {
    const user_id = req.user.id; // from JWT
    const { tmdb_id, stars, body } = req.body;
    const review = await reviewModel.createReview({ user_id, tmdb_id, stars, body });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

export const getReviewsByMovie = async (req, res, next) => {
  try {
    const { tmdb_id } = req.params;
    const reviews = await reviewModel.getReviewsByMovie(tmdb_id);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const getReviewsByUser = async (req, res, next) => {
  try {
    const user_id = req.user.id; // from JWT
    const reviews = await reviewModel.getReviewsByUser(user_id);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};