import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        adminEmail: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Since there is no actual public signup API, 
        // we'll simulate a success and redirect to login
        setTimeout(() => {
            alert("Signup request submitted! Please check your email or contact support to activate your instance.");
            setLoading(false);
            navigate('/login');
        }, 1500);
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                {/* Left Side: Visual */}
                <div className="login-sidebar">
                    <div className="brand-icon-lg">
                        <i className="bi bi-grid-1x2-fill"></i>
                    </div>
                    <h2 className="fw-bold mb-3">Join ERPION</h2>
                    <p className="opacity-75 fs-5">Set up your institute's ERP instance in minutes and start managing operations efficiently.</p>
                </div>

                {/* Right Side: Form */}
                <div className="login-form-container">
                    <div className="mb-4">
                        <h3 className="fw-bold mb-1">Start Free Trial</h3>
                        <p className="text-muted">Create your organization account.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-medium">Company Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. SkillMax Academy"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-medium">Admin Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="admin@example.com"
                                value={formData.adminEmail}
                                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                required
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-medium">Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 fw-medium mb-3 shadow-sm" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>Provisioning...
                                </>
                            ) : (
                                'Create My Instance'
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-muted small mb-0">
                                Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
