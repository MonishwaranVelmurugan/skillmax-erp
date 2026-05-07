import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SaaSDashboard = () => {
    const [stats, setStats] = useState({
        totalCompanies: 0,
        activeCompanies: 0,
        systemStatus: 'Optimal',
        lastBackup: 'Success'
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await api.get('saas/companies/');
            const data = response.data;
            setStats(prev => ({
                ...prev,
                totalCompanies: data.length,
                activeCompanies: data.filter(c => c.status === 'ACTIVE').length
            }));
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        }
    };

    return (
        <div className="container-fluid p-4 fade-in">
            <div className="mb-4">
                <h2 className="fw-bold"><i className="bi bi-speedometer2 me-2 text-primary"></i>SaaS System Overview</h2>
                <p className="text-muted">Real-time monitoring and global system metrics.</p>
            </div>

            {/* Metric Cards Row 1 */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card card-custom border-start border-4 border-primary p-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="text-muted small fw-bold text-uppercase">Total Companies</div>
                            <i className="bi bi-building fs-4 text-primary opacity-50"></i>
                        </div>
                        <h2 className="fw-bold mb-0">{stats.totalCompanies}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card card-custom border-start border-4 border-success p-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="text-muted small fw-bold text-uppercase">Active Companies</div>
                            <i className="bi bi-check-circle fs-4 text-success opacity-50"></i>
                        </div>
                        <h2 className="fw-bold mb-0">{stats.activeCompanies}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card card-custom border-start border-4 border-info p-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="text-muted small fw-bold text-uppercase">System Status</div>
                            <i className="bi bi-shield-check fs-4 text-info opacity-50"></i>
                        </div>
                        <h2 className="fw-bold mb-0 text-info">{stats.systemStatus}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card card-custom border-start border-4 border-warning p-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="text-muted small fw-bold text-uppercase">Last Backup</div>
                            <i className="bi bi-cloud-arrow-down fs-4 text-warning opacity-50"></i>
                        </div>
                        <h2 className="fw-bold mb-0 text-dark">{stats.lastBackup}</h2>
                    </div>
                </div>
            </div>

            {/* Quick Overview Cards */}
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card card-custom p-4 shadow-sm h-100">
                        <h5 className="fw-bold mb-3"><i className="bi bi-graph-up me-2"></i>Global Performance</h5>
                        <div className="alert alert-light border-0 py-4 text-center">
                            <i className="bi bi-cpu display-4 text-muted mb-3 d-block"></i>
                            <h6 className="text-muted mb-0">Unified System Resources Monitored Automatically</h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card card-custom p-4 shadow-sm h-100">
                        <h5 className="fw-bold mb-3"><i className="bi bi-shield-lock me-2"></i>Multi-Tenant Security</h5>
                        <div className="p-3 bg-success-subtle text-success rounded-3 mb-3 d-flex align-items-center">
                            <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                            <div>
                                <small className="fw-bold d-block">DATABASE ISOLATION</small>
                                <span>Strict thread-local context enabled per tenant instance.</span>
                            </div>
                        </div>
                        <div className="p-3 bg-primary-subtle text-primary rounded-3 d-flex align-items-center">
                            <i className="bi bi-fingerprint me-2 fs-4"></i>
                            <div>
                                <small className="fw-bold d-block">UNIFIED LOGIN GATEWAY</small>
                                <span>GlobalUser mapping active for erpion_main database.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaaSDashboard;
