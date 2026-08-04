import { useState } from "react";
import "./CastCard.css";

const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23333' width='80' height='80' rx='40'/%3E%3Ctext fill='%23888' font-family='Arial' font-size='28' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E?%3C/text%3E%3C/svg%3E";

function CastCard({ cast }) {
  const [imgFailed, setImgFailed] = useState(false);

  const name = cast.name || cast.actor_name || "Unknown";
  const character = cast.character || cast.character_name || "";
  const profileUrl = cast.profile_url || cast.actor_image_url || "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="cast-card">
      {profileUrl && !imgFailed ? (
        <img
          className="cast-avatar"
          src={profileUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="cast-avatar-placeholder">{initials}</div>
      )}
      <div className="cast-name" title={name}>{name}</div>
      <div className="cast-character" title={character}>{character || "Unknown Role"}</div>
    </div>
  );
}

export default CastCard;
