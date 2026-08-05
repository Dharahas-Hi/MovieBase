import { Link } from "react-router-dom";
import "./Admin.css";

function Admin() {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <div className="admin-error-icon" style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1>Admin Panel Removed</h1>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 480, margin: "16px auto" }}>
            MovieBase fetches all movie data live and no longer requires a
            backend or admin panel.
            <br /><br />
            Everything you see is powered by MovieBase's own content feeds.
          </p>
          <Link to="/" className="admin-btn" style={{ textDecoration: "none", display: "inline-block", marginTop: 20 }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Admin;
