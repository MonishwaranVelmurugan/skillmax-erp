import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleSignupClick = () => {
        navigate('/signup');
    };

    return (
        <div className="landing-page">
            {/* Header / Navbar */}
            <header className="landing-header shadow-sm">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="landing-logo">
                        <div className="brand-icon me-2">
                            <i className="bi bi-grid-1x2-fill"></i>
                        </div>
                        <span className="brand-name">ERPION</span>
                    </div>
                    <nav className="landing-nav d-flex gap-2">
                        <button className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm" onClick={handleLoginClick}>
                            Login
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section text-center">
                <div className="container">
                    <h1 className="hero-title display-4 fw-bold mb-4">
                        ERPION – Smart ERP for <span className="text-primary">Training Institutes</span>
                    </h1>
                    <p className="hero-subtitle lead text-muted mb-5">
                        Manage Leads, Admissions, Students, Fees, and Certificates in one platform.
                    </p>
                    <div className="hero-actions d-flex justify-content-center flex-wrap gap-3">
                        <button className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow" onClick={handleSignupClick}>
                            Start Free Trial
                        </button>
                        <button className="btn btn-outline-primary btn-lg px-5 py-3 fw-bold rounded-pill" onClick={handleLoginClick}>
                            Login
                        </button>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="hero-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5 mt-4">
                        <h2 className="section-heading fw-bold">Powerful Features</h2>
                        <div className="heading-line"></div>
                    </div>
                    <div className="row g-4 justify-content-center">
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card card border-0 shadow-sm h-100 p-4 text-center">
                                <div className="feature-icon bg-blue-light text-primary mb-3">
                                    <i className="bi bi-person-plus-fill fs-2"></i>
                                </div>
                                <h4 className="feature-title fw-bold">Lead Management</h4>
                                <p className="text-muted mb-0">Track and convert prospects into students efficiently.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card card border-0 shadow-sm h-100 p-4 text-center">
                                <div className="feature-icon bg-teal-light text-success mb-3">
                                    <i className="bi bi-clipboard-check-fill fs-2"></i>
                                </div>
                                <h4 className="feature-title fw-bold">Admission Workflow</h4>
                                <p className="text-muted mb-0">Streamlined admission system with structured multi-step student onboarding.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card card border-0 shadow-sm h-100 p-4 text-center">
                                <div className="feature-icon bg-orange-light text-warning mb-3">
                                    <i className="bi bi-people-fill fs-2"></i>
                                </div>
                                <h4 className="feature-title fw-bold">Student Dashboard</h4>
                                <p className="text-muted mb-0">Centralized student dashboard with academic history, financial details, and certificates.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card card border-0 shadow-sm h-100 p-4 text-center">
                                <div className="feature-icon bg-purple-light text-danger mb-3">
                                    <i className="bi bi-currency-dollar fs-2"></i>
                                </div>
                                <h4 className="feature-title fw-bold">Fee Management</h4>
                                <p className="text-muted mb-0">Track payments, discounts, pending balances, and generate receipts.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card card border-0 shadow-sm h-100 p-4 text-center">
                                <div className="feature-icon bg-indigo-light text-info mb-3">
                                    <i className="bi bi-patch-check-fill fs-2"></i>
                                </div>
                                <h4 className="feature-title fw-bold">Certificate System</h4>
                                <p className="text-muted mb-0">Manage student certificate eligibility and generation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section py-5">
                <div className="container">
                    <div className="text-center mb-5 mt-4">
                        <h2 className="section-heading fw-bold">Simple, Transparent Pricing</h2>
                        <div className="heading-line"></div>
                    </div>
                    <div className="row g-4 justify-content-center">
                        <div className="col-md-6 col-lg-4">
                            <div className="pricing-card card border-0 shadow-sm h-100 p-5 text-center">
                                <h4 className="fw-bold mb-3">Starter Plan</h4>
                                <h2 className="display-5 fw-bold text-primary mb-3">₹1500<span className="fs-5 text-muted fw-normal"> / month</span></h2>
                                <p className="text-muted mb-4">Up to 100 students</p>
                                <button className="btn btn-outline-primary btn-lg w-100 rounded-pill fw-bold" onClick={handleSignupClick}>Get Started</button>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="pricing-card card border-primary shadow h-100 p-5 text-center position-relative transform-scale">
                                <div className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-primary px-3 py-2 text-uppercase fw-bold">Recommended</div>
                                <h4 className="fw-bold mb-3 mt-2">Professional Plan</h4>
                                <h2 className="display-5 fw-bold text-primary mb-3">₹3500<span className="fs-5 text-muted fw-normal"> / month</span></h2>
                                <p className="text-muted mb-4">Up to 500 students</p>
                                <button className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm" onClick={handleSignupClick}>Get Started</button>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="pricing-card card border-0 shadow-sm h-100 p-5 text-center">
                                <h4 className="fw-bold mb-3">Enterprise Plan</h4>
                                <h2 className="display-5 fw-bold text-primary mb-3">Custom<span className="fs-5 text-muted fw-normal"> pricing</span></h2>
                                <p className="text-muted mb-4">Unlimited students</p>
                                <button className="btn btn-outline-dark btn-lg w-100 rounded-pill fw-bold" onClick={handleSignupClick}>Contact Us</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer py-5 text-white">
                <div className="container pt-3">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-3 mb-md-0 text-center text-md-start">
                            <div className="footer-logo mb-2 d-flex align-items-center justify-content-center justify-content-md-start">
                                <i className="bi bi-grid-1x2-fill me-2 fs-4 text-primary"></i>
                                <span className="fs-4 fw-bold">ERPION</span>
                            </div>
                            <p className="text-muted mb-0">&copy; ERPION 2026. All rights reserved.</p>
                        </div>
                        <div className="col-md-6 text-center text-md-end">
                            <button className="btn btn-link text-muted text-decoration-none me-4 hover-white" onClick={handleLoginClick}>Login</button>
                            <button className="btn btn-link text-muted text-decoration-none hover-white" onClick={handleSignupClick}>Signup</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
