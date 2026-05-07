import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const CompanyOverview = () => {
    const { companyId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOverview();
    }, [companyId]);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const response = await api.get(`saas/companies/overview/${companyId}/`);
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch company overview:', err);
            setError(err.response?.data?.error || 'Failed to load company overview');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container p-4">
                <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                    <div>
                        <h5 className="mb-1 fw-bold">Error loading overview</h5>
                        <p className="mb-0">{error}</p>
                    </div>
                </div>
                <Link to="/company-management" className="btn btn-outline-secondary mt-3">
                    <i className="bi bi-arrow-left me-2"></i>Back to Company Management
                </Link>
            </div>
        );
    }

    const { company, admin, stats, recent_activity } = data;

    return (
        <div className="container-fluid p-4 fade-in">
            {/* Header section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item small"><Link to="/company-management">Company Management</Link></li>
                            <li className="breadcrumb-item small active" aria-current="page">Overview</li>
                        </ol>
                    </nav>
                    <h2 className="fw-bold mb-0">
                        <i className="bi bi-building me-2 text-primary"></i>
                        {company.company_name}
                    </h2>
                </div>
                <button className="btn btn-light border shadow-sm" onClick={fetchOverview}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Refresh Stats
                </button>
            </div>

            <div className="row g-4">
                {/* Basic Info & Admin Info */}
                <div className="col-lg-4">
                    {/* Basic Info Card */}
                    <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                        <div className="card-header bg-primary text-white py-3 border-0">
                            <h5 className="mb-0 fw-bold small text-uppercase letter-spacing-1">Instance Details</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Database Name</label>
                                <code className="fs-6 d-block bg-light p-2 rounded">{company.database_name}</code>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Creation Date</label>
                                <div className="fw-medium">{company.created_at}</div>
                            </div>
                            <div className="mb-0">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Status</label>
                                <span className={`badge rounded-pill px-3 py-2 ${company.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                    {company.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Details Card */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-dark text-white py-3 border-0">
                            <h5 className="mb-0 fw-bold small text-uppercase letter-spacing-1">Admin Access info</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-light rounded-circle p-3 me-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-person-badge fs-2"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">{admin.username}</h6>
                                    <span className="badge bg-primary-subtle text-primary small">Owner / Admin</span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Email Address</label>
                                <div className="fw-medium">{admin.email}</div>
                            </div>
                            <div className="mb-0">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Role Type</label>
                                <div className="fw-medium">{admin.role}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="col-lg-8">
                    <div className="row g-4 mb-4">
                        <div className="col-sm-6 col-xl-3">
                            <div className="card border-0 shadow-sm h-100 rounded-4 p-4 text-center">
                                <div className="mx-auto bg-primary-subtle text-primary rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-people fs-3"></i>
                                </div>
                                <h3 className="fw-bold mb-1">{stats.total_students}</h3>
                                <p className="text-muted small mb-0 text-uppercase fw-bold">Students</p>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="card border-0 shadow-sm h-100 rounded-4 p-4 text-center">
                                <div className="mx-auto bg-info-subtle text-info rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-telephone fs-3"></i>
                                </div>
                                <h3 className="fw-bold mb-1">{stats.total_leads}</h3>
                                <p className="text-muted small mb-0 text-uppercase fw-bold">Total Leads</p>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="card border-0 shadow-sm h-100 rounded-4 p-4 text-center">
                                <div className="mx-auto bg-success-subtle text-success rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-mortarboard fs-3"></i>
                                </div>
                                <h3 className="fw-bold mb-1">{stats.total_admissions}</h3>
                                <p className="text-muted small mb-0 text-uppercase fw-bold">Admissions</p>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="card border-0 shadow-sm h-100 rounded-4 p-4 text-center">
                                <div className="mx-auto bg-warning-subtle text-warning rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-briefcase fs-3"></i>
                                </div>
                                <h3 className="fw-bold mb-1">{stats.total_staff}</h3>
                                <p className="text-muted small mb-0 text-uppercase fw-bold">Staff Members</p>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Tenant Metrics Breakdown</h5>
                            <span className="badge bg-light text-dark border">Real-time Data</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="list-group list-group-flush">
                                <div className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3"><i className="bi bi-book text-primary"></i></div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">Unique Courses</h6>
                                            <p className="mb-0 small text-muted">Active academic programs</p>
                                        </div>
                                    </div>
                                    <span className="fs-5 fw-bold">{stats.total_courses}</span>
                                </div>
                                <div className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3"><i className="bi bi-database text-primary"></i></div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">Data Isolation</h6>
                                            <p className="mb-0 small text-muted">Physical MySQL Database separation</p>
                                        </div>
                                    </div>
                                    <span className="badge bg-success small">Verified</span>
                                </div>
                                <div className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3"><i className="bi bi-shield-check text-primary"></i></div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">Admin Privileges</h6>
                                            <p className="mb-0 small text-muted">Dedicated tenant owner account</p>
                                        </div>
                                    </div>
                                    <span className="badge bg-success small">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden recent-activity-card">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center activity-header">
                            <h5 className="mb-0 fw-bold">Recent Activity</h5>
                            <span className="badge bg-light text-dark border">Recent Logs</span>
                        </div>
                        <div className="card-body p-0">
                            {recent_activity && recent_activity.length > 0 ? (
                                <div className="activity-list">
                                    <div className="list-group list-group-flush">
                                        {recent_activity.map((log, index) => (
                                            <div key={index} className="list-group-item px-4 py-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <h6 className="mb-0 fw-bold text-primary">{log.action}</h6>
                                                    <small className="text-muted">{log.date}</small>
                                                </div>
                                                <p className="mb-1 small text-dark">{log.description}</p>
                                                <div className="small text-muted">
                                                    <i className="bi bi-person me-1"></i> {log.user}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 text-center text-muted">
                                    <i className="bi bi-clock-history fs-1 d-block mb-3 opacity-25"></i>
                                    No recent activity logs found for this tenant.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyOverview;
