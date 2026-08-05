import { useState } from "react";
import "./MovieReviews.css";

const INITIAL_VISIBLE = 5;

function MovieReviews({ reviews }) {
  const [showAll, setShowAll] = useState(false);

  const visibleReviews = reviews?.slice(0, INITIAL_VISIBLE) || [];
  const remaining = reviews?.slice(INITIAL_VISIBLE) || [];
  const hasMore = remaining.length > 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const renderReviewCard = (review, index) => (
    <div key={review.review_id || index} className="review-card">
      <div className="review-header">
        <div className="review-user">
          <div className="review-avatar">
            {review.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="review-username">{review.username}</div>
            <div className="review-date">{formatDate(review.created_at)}</div>
          </div>
        </div>
        {review.rating > 0 && (
          <div className="review-rating">
            <span className="review-rating-value">{review.rating}/10</span>
          </div>
        )}
      </div>
      {review.comment && <p className="review-comment">{review.comment}</p>}
    </div>
  );

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <h2>
          Reviews
          {reviews?.length > 0 && (
            <span className="review-count">({reviews.length})</span>
          )}
        </h2>
      </div>

      {reviews && reviews.length > 0 ? (
        <>
          {/* First N reviews */}
          {visibleReviews.map((review, idx) => renderReviewCard(review, idx))}

          {/* Hidden remaining reviews */}
          {hasMore && (
            <div className={`reviews-extra ${showAll ? "visible" : ""}`}>
              {showAll && remaining.map((review, idx) =>
                renderReviewCard(review, INITIAL_VISIBLE + idx)
              )}
            </div>
          )}

          {/* Show More / Show Less */}
          {hasMore && (
            <div className="reviews-toggle-wrap">
              <button
                className="reviews-toggle-btn"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll
                  ? `▲ Show Less`
                  : `▼ Show All (${reviews.length} reviews)`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="reviews-empty">
          <span className="reviews-empty-icon">💬</span>
          <p className="no-reviews">No reviews yet from the MovieBase community.</p>
        </div>
      )}
    </section>
  );
}

export default MovieReviews;
