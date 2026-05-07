import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import storageService from '../../services/storageService';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = storageService.getCurrentUser();

    React.useEffect(() => {
        if (!storageService.isAuthenticated() || localStorage.getItem('role') !== 'STUDENT') {
            navigate('/student-login', { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        storageService.logout();
        localStorage.removeItem('role');
        navigate('/');
    };

    const navLinks = [
        { path: '/student/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
        { path: '/student/course', icon: 'bi-book', label: 'My Course' },
        { path: '/student/payments', icon: 'bi-credit-card', label: 'Payments' },
        { path: '/student/certificate', icon: 'bi-patch-check', label: 'Certificates' },
        { path: '/student/profile', icon: 'bi-person', label: 'Profile' },
    ];

    return (
        <div className="student-portal-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3" style={{ zIndex: 10 }}>
                <div className="container">
                    <Link className="navbar-brand fw-bold d-flex align-items-center" to="/student/dashboard">
                        <i className="bi bi-mortarboard-fill me-2 fs-3"></i>
                        <span>ERPION <small className="fw-normal opacity-75">| Student Portal</small></span>
                    </Link>
                    <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#studentNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="studentNav">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                            {navLinks.map(link => (
                                <li className="nav-item mx-lg-2" key={link.path}>
                                    <Link
                                        className={`nav-link d-flex align-items-center px-3 rounded-pill transition-all ${location.pathname === link.path ? 'bg-white bg-opacity-25 active fw-bold' : ''}`}
                                        to={link.path}
                                    >
                                        <i className={`bi ${link.icon} me-2`}></i> {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="d-flex align-items-center">
                            <div className="text-end me-3 d-none d-lg-block">
                                <div className="text-white small lh-1 fw-bold">{user?.name}</div>
                                <div className="text-white-50 extra-small" style={{ fontSize: '0.7rem' }}>Roll: {user?.roll_no}</div>
                            </div>
                            <button className="btn btn-light btn-sm rounded-circle p-2" onClick={handleLogout} title="Logout">
                                <i className="bi bi-box-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow-1 bg-light py-4 fade-in">
                <div className="container">
                    <Outlet />
                </div>
            </main>

            <footer className="py-4 text-center text-muted small bg-white border-top">
                <p className="mb-0">© 2026 Erpion ERP - Empowering Education</p>
            </footer>
        </div>
    );
};

export default StudentLayout;
