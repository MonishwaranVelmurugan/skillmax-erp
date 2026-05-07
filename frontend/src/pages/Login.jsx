import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            // Backend expects username/password for admin
            const res = await axios.post("http://localhost:8000/api/login/", {
                username,
                password,
            });

            // Save credentials for the dashboard
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("a3_campus_user", JSON.stringify(res.data.user));
            localStorage.setItem("role", res.data.role);

            // Redirect to dashboard
            navigate("/dashboard");

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Login failed - Invalid Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow-lg p-5" style={{ width: "400px", borderRadius: "20px" }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">Skillmax ERP</h2>
                    <p className="text-muted">Enter your admin credentials</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 fw-bold"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login to Dashboard"}
                    </button>
                </form>

                <div className="mt-4 text-center small text-muted">
                    &copy; 2026 Skillmax ERP
                </div>
            </div>
        </div>
    );
}
