import { useState } from "react";
import "./MovieGallery.css";

const INITIAL_SHOW = 6;
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect fill='%231a1a1a' width='400' height='225'/%3E%3Ctext fill='%23555' font-family='Arial' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage unavailable%3C/text%3E%3C/svg%3E";

function MovieGallery({ images }) {
  const [lightbox, setLightbox] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

  if (!images || images.length === 0) {
    return (
      <section className="gallery-section">
        <h2>Gallery</h2>
        <p className="gallery-empty">No images available yet.</p>
      </section>
    );
  }

  const visibleImages = showAll ? images : images.slice(0, INITIAL_SHOW);
  const hasMore = images.length > INITIAL_SHOW;

  const handleImageError = (imageId) => {
    setFailedImages((prev) => new Set(prev).add(imageId));
  };

  return (
    <section className="gallery-section">
      <div className="gallery-header">
        <h2>Gallery</h2>
        <span className="gallery-count">{images.length} images</span>
      </div>

      <div className="gallery-grid">
        {visibleImages.map((img) => {
          const isFailed = failedImages.has(img.image_id);
          return (
            <div
              key={img.image_id}
              className={`gallery-item ${isFailed ? "failed" : ""}`}
              onClick={() => !isFailed && setLightbox(img)}
            >
              {!isFailed ? (
                <img
                  src={img.file_url}
                  alt="Movie scene"
                  loading="lazy"
                  decoding="async"
                  onError={() => handleImageError(img.image_id)}
                />
              ) : (
                <div className="gallery-fallback">
                  <span className="gallery-fallback-icon">🖼️</span>
                  <span>Image unavailable</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More / Show Less */}
      {hasMore && (
        <div className="gallery-toggle-wrap">
          <button
            className="gallery-toggle-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? `▲ Show Less (${INITIAL_SHOW})`
              : `▼ Show All (${images.length})`}
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button
            className="gallery-lightbox-close"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <img
            src={lightbox.file_url}
            alt="Movie scene"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

export default MovieGallery;
