import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

/**
 * TenantGlobalSearch Component
 * Provides a debounced global search across Students, Leads, and Staff.
 * Only searches within the current logged-in tenant's database.
 */
const TenantGlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced Search Effect
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                // The API routes to current tenant based on Authorization/x-database headers
                const response = await api.get(`tenant-global-search/?q=${encodeURIComponent(query.trim())}`);
                setResults(response.data);
                setShowResults(true);
            } catch (err) {
                console.error("Global search error:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400); // 400ms debounce as requested

        return () => clearTimeout(timer);
    }, [query]);

    const handleResultClick = (result) => {
        setQuery('');
        setShowResults(false);

        switch (result.type) {
            case 'student':
                // Using existing StudentDetails query param logic
                navigate(`/students?rollno=${result.roll_no}`);
                break;
            case 'lead':
                // Using existing LeadFollowup query param logic
                navigate(`/leads/followup?leadId=${result.id}`);
                break;
            case 'staff':
                // Navigate to Manage Users
                navigate(`/manage-users`);
                break;
            default:
                break;
        }
    };

    return (
        <div className="tenant-search-container mx-3" style={{ position: 'relative', minWidth: '350px' }} ref={dropdownRef}>
            <div className="input-group search-group">
                <span className="input-group-text bg-transparent border-0 border-bottom border-secondary border-opacity-25 py-2 px-3">
                    <i className="bi bi-search text-muted"></i>
                </span>
                <input
                    type="text"
                    className="form-control bg-transparent border-0 border-bottom border-secondary border-opacity-25 shadow-none py-2"
                    style={{ color: 'inherit' }}
                    placeholder="Search globally..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                />
                {loading && (
                    <span className="input-group-text bg-transparent border-0 border-bottom border-secondary border-opacity-25 py-2">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    </span>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showResults && (
                <div
                    className="global-search-dropdown fade-in"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--search-bg)',
                        borderRadius: '12px',
                        marginTop: '10px',
                        maxHeight: '350px',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        zIndex: 2000,
                        border: '1px solid var(--search-border)',
                        animation: 'slideUp 0.2s ease-out'
                    }}
                >
                    {results.length > 0 ? (
                        results.map((res, index) => (
                            <div
                                key={index}
                                onClick={() => handleResultClick(res)}
                                className="search-result-item"
                                style={{
                                    cursor: 'pointer',
                                    padding: '12px 20px',
                                    borderBottom: index === results.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--search-item-hover)';
                                    e.currentTarget.style.paddingLeft = '25px';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.paddingLeft = '20px';
                                }}
                            >
                                <div
                                    className="result-icon d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {res.type === 'student' && <i className="bi bi-mortarboard text-primary"></i>}
                                    {res.type === 'lead' && <i className="bi bi-telephone text-success"></i>}
                                    {res.type === 'staff' && <i className="bi bi-person-badge text-info"></i>}
                                </div>
                                <div className="result-info flex-grow-1">
                                    <div className="fw-bold" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{res.name}</div>
                                    <div className="text-secondary opacity-75" style={{ fontSize: '0.75rem' }}>
                                        {res.type === 'student' && (
                                            <>
                                                <span className="badge bg-primary-subtle text-primary me-2">Student</span>
                                                Roll No: {res.roll_no}
                                            </>
                                        )}
                                        {res.type === 'lead' && (
                                            <>
                                                <span className="badge bg-success-subtle text-success me-2">Lead</span>
                                                Phone: {res.phone}
                                            </>
                                        )}
                                        {res.type === 'staff' && (
                                            <>
                                                <span className="badge bg-info-subtle text-info me-2">Staff</span>
                                                {res.email}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="ms-auto text-muted small">
                                    <i className="bi bi-chevron-right"></i>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center">
                            <i className="bi bi-search text-muted fs-4 d-block mb-2"></i>
                            <div className="text-muted small">No records found for "{query}"</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TenantGlobalSearch;
