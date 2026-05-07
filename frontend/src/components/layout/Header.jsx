import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import storageService from '../../services/storageService';
import api from '../../services/api';

import TenantGlobalSearch from '../search/TenantGlobalSearch';

const Header = ({ title, toggleSidebar }) => {
    const navigate = useNavigate();
    const user = storageService.getCurrentUser();
    const [theme, setTheme] = useState(storageService.getTheme());

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        storageService.setTheme(theme);
    }, [theme]);

    const handleLogout = async () => {
        try {
            await api.post('logout/');
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            storageService.logout();
            navigate('/');
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="main-header">
            <div className="header-title-wrapper d-flex align-items-center flex-grow-1">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <i className="bi bi-list"></i>
                </button>
                <h2 className="page-title me-4 d-none d-lg-block">
                    ERPION {user?.company_name ? `| ${user.company_name}` : ''}
                </h2>
                <div className="d-none d-md-block">
                    <TenantGlobalSearch />
                </div>
            </div>

            <div className="d-flex align-items-center gap-2">
                <button
                    className="btn btn-light rounded-circle p-2"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    <i className={`bi bi-${theme === 'light' ? 'moon-fill' : 'sun-fill'}`}></i>
                </button>

                <div className="dropdown">
                    <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle text-dark px-2" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                        <div className="bg-primary text-white rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="d-none d-sm-inline mx-1 fw-medium text-inherit">{user?.username || 'User'}</span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="dropdownUser1">
                        <li className="px-3 py-2 border-bottom mb-2">
                            <p className="mb-0 small text-muted">Signed in as</p>
                            <p className="mb-0 fw-bold small text-primary">{user?.role?.toUpperCase()}</p>
                            <p className="mb-0 small text-muted mt-1">{user?.username}</p>
                        </li>
                        <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i> Profile</Link></li>
                        <li><button className="dropdown-item" onClick={toggleTheme}><i className={`bi bi-${theme === 'light' ? 'moon' : 'sun'} me-2`}></i> {theme === 'light' ? 'Dark Mode' : 'Light Mode'}</button></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Sign out</button></li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;

