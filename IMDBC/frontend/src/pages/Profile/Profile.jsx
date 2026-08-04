import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/api";
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        getCurrentUser()
            .then(({ data }) => setUser(data))
            .catch(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    if (loading) {
        return <div className="loading-screen"><div className="loader"></div></div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-avatar">
                    {user.username?.[0]?.toUpperCase() || "?"}
                </div>
                <h1>{user.username}</h1>
                <p className="profile-email">{user.email}</p>
                <div className="profile-details">
                    <div>
                        <span>User ID</span>
                        <p>{user.user_id}</p>
                    </div>
                    <div>
                        <span>Email</span>
                        <p>{user.email}</p>
                    </div>
                </div>
                <button className="profile-logout" onClick={handleLogout}>
                    Sign Out
                </button>
            </div>
        </div>
    );
}

export default Profile;