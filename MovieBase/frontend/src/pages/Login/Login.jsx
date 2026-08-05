import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";
import "./Login.css";

function Login() {
    const [form, setForm] = useState({ identifier: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = form.identifier.includes("@")
                ? { email: form.identifier, password: form.password }
                : { username: form.identifier, password: form.password };

            const { data } = await loginUser(payload);
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/profile");
        } catch (err) {
            if (!err.response) {
                setError("Unable to connect to the server. Please make sure the backend is running.");
            } else {
                setError(err.response?.data?.detail || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <div className="login-logo">
                    MOVIEBASE
                </div>

                <h2>Sign In</h2>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label>Username or Email</label>
                        <input
                            id="identifier"
                            name="identifier"
                            value={form.identifier}
                            onChange={handleChange}
                            placeholder="Enter username or email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>

                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button
                    className="register-btn"
                    onClick={() => navigate("/register")}
                >
                    Create New Account
                </button>

            </div>
        </div>
    );
}

export default Login;