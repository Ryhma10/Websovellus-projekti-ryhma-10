import { useState, useEffect } from "react";
import './MovieModal.css';
import placeholder from '../assets/placeholder.png';

function MovieModal({ movie, onClose }) {
    const [reviewText, setReviewText] = useState("");
    const [stars, setStars] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [showReviews, setShowReviews] = useState(false);

    useEffect(() => {
        async function fetchReviews() {
            const res = await fetch(`http://localhost:3001/api/reviews/movie/${movie.id}`);
            const data = await res.json();
            setReviews(data);
        }
        if (movie) fetchReviews();
    }, [movie]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        console.log("JWT token:", token);
        await fetch("http://localhost:3001/api/reviews", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                tmdb_id: movie.id,
                stars,
                body: reviewText,
            }),
        });
        setReviewText("");
        setStars(0);
        // Refresh reviews
        const res = await fetch(`http://localhost:3001/api/reviews/movie/${movie.id}`);
        const data = await res.json();
        setReviews(data);
        console.log("Review submitted: ", data);
    };

    //Calculate average stars
    const averageStars = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : "No reviews yet";

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="movie-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                <h2 className="modal-title">{movie.title}</h2>
                <div className="modal-content">
                <img 
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : placeholder} 
                alt={movie.title} 
                className="modal-poster"
                />
                <p className="movie-overview">{movie.overview}</p>
                </div>
                <h3>Average Rating: {averageStars} ⭐</h3>
                <button onClick={() => setShowReviews(!showReviews)}>
                    {showReviews ? "Hide Reviews" : "Show Reviews"}
                </button>
                {showReviews && (
                    <ul className="reviews-list">
                        {reviews.length === 0 ? (
                            <li>No reviews yet</li>
                        ) : (
                            reviews.map((r, idx) => (
                                <li key={idx}>
                                    <strong>{r.username}</strong>: {r.stars} ⭐ - "{r.body}"
                                </li>
                            ))
                        )}
                    </ul>
                )}
                <form onSubmit={handleSubmit}>
                    <textarea
                        className="review-textarea"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review..."
                        maxLength={300}
                        required
                    />
                    <br />
                    <label>
                        Stars:
                            <div style={{ display: "inline-block", marginLeft: "8px" }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    style={{
                                    cursor: "pointer",
                                    color: star <= stars ? "#FFD700" : "#ccc",
                                    fontSize: "1.5rem",
                                    }}
                                    onClick={() => setStars(star)}
                                    onMouseOver={() => setStars(star)}
                                    onMouseOut={() => setStars(stars)}
                                    role="button"
                                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                >
                                    ★
                                </span>
                                ))}
                            </div>
                    </label>
                    <br />
                    <button type="submit" className="submit">Submit Review</button>
                </form>
            </div>
        </div>
    )
}

export default MovieModal;