import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        admin_email: '',
        admin_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        id: '',
        company_name: '',
        admin_email: '',
        status: '',
        new_password: ''
    });

    // Initial Load
    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setIsRefreshing(true);
        try {
            const response = await api.get('saas/companies/');
            setCompanies(response.data);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            const status = error.response?.status;
            const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message;
            alert(`Unable to refresh company list [${status || 'Network Error'}]: ${errorMsg}`);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('saas/companies/create/', formData);
            alert("Company Created Successfully");
            setShowRegisterModal(false);
            setFormData({ company_name: '', admin_email: '', admin_password: '' });
            loadCompanies();
        } catch (error) {
            alert('Error creating company: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCompany = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                company_name: editData.company_name,
                admin_email: editData.admin_email,
                status: editData.status
            };
            if (editData.new_password) {
                payload.new_password = editData.new_password;
            }
            await api.put(`saas/companies/${editData.id}/update/`, payload);
            alert("Company updated successfully");
            setShowEditModal(false);
            loadCompanies();
        } catch (error) {
            alert('Error updating company: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (company) => {
        setEditData({
            id: company.id,
            company_name: company.company_name,
            admin_email: company.admin_email,
            status: company.status,
            new_password: ''
        });
        setShowEditModal(true);
    };

    const handleDeleteCompany = async (companyId, companyName) => {
        if (window.confirm(`Deleting this company will permanently remove:\n• Tenant Database\n• All Users\n• All ERP Data\n\nAre you sure you want to delete ${companyName}?`)) {
            try {
                await api.delete(`saas/companies/delete/${companyId}/`);
                alert('Company deleted successfully');
                loadCompanies();
            } catch (error) {
                console.error("Failed to delete company:", error);
                alert('Error deleting company: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    return (
        <div className="container-fluid p-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold"><i className="bi bi-building me-2 text-primary"></i>Company Management</h2>
                <div>
                    <button
                        className="btn btn-light border shadow-sm me-2"
                        onClick={loadCompanies}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <><span className="spinner-border spinner-border-sm me-1"></span> Refreshing...</>
                        ) : (
                            <><i className="bi bi-arrow-clockwise me-1"></i> Refresh</>
                        )}
                    </button>
                    <button
                        className="btn btn-primary shadow-sm"
                        onClick={() => setShowRegisterModal(true)}
                    >
                        <i className="bi bi-plus-lg me-1"></i> Register New Client Instance
                    </button>
                </div>
            </div>

            {/* Company Table */}
            <div className="card card-custom p-0 border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 fw-bold">Active Tenant Instances</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Company Name</th>
                                <th>Admin Email</th>
                                <th>Database Name</th>
                                <th>Status</th>
                                <th>Created Date</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        No companies registered yet.
                                    </td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr key={company.id}>
                                        <td className="ps-4 fw-bold">
                                            <Link to={`/company-overview/${company.id}`} className="text-decoration-none text-primary">
                                                {company.company_name}
                                            </Link>
                                        </td>
                                        <td>{company.admin_email}</td>
                                        <td><code>{company.database_name}</code></td>
                                        <td>
                                            <span className={`badge rounded-pill ${company.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                {company.status}
                                            </span>
                                        </td>
                                        <td>{company.created_at}</td>
                                        <td className="text-end pe-4">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                title="Edit Company"
                                                onClick={() => openEditModal(company)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                title="Delete Company"
                                                onClick={() => handleDeleteCompany(company.id, company.company_name)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Register New Company Modal */}
            {showRegisterModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <form onSubmit={handleCreateCompany}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Register New Client Instance</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowRegisterModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg bg-light border-0"
                                            placeholder="e.g. SkillMax Academy"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Admin Email</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg bg-light border-0"
                                            placeholder="admin@example.com"
                                            value={formData.admin_email}
                                            onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Initial Admin Password</label>
                                        <div className="position-relative">
                                            <input
                                                type={showAdminPassword ? "text" : "password"}
                                                className="form-control form-control-lg bg-light border-0 pe-5"
                                                value={formData.admin_password}
                                                onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none"
                                                onClick={() => setShowAdminPassword(!showAdminPassword)}
                                                style={{ paddingRight: '15px' }}
                                            >
                                                <i className={`bi ${showAdminPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="alert alert-primary border-0 small d-flex align-items-center mb-0">
                                        <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                                        <span>Automated database provisioning and ERP schema setup will be initiated.</span>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-3 px-4" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-3 px-4" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Creating...
                                            </>
                                        ) : 'Create Company'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Company Modal */}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <form onSubmit={handleUpdateCompany}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Edit Company Instance</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg bg-light border-0"
                                            value={editData.company_name}
                                            onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Admin Email</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg bg-light border-0"
                                            value={editData.admin_email}
                                            onChange={(e) => setEditData({ ...editData, admin_email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Status</label>
                                        <select
                                            className="form-select form-select-lg bg-light border-0"
                                            value={editData.status}
                                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="DISABLED">DISABLED</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Change Admin Password (Optional)</label>
                                        <div className="position-relative">
                                            <input
                                                type={showAdminPassword ? "text" : "password"}
                                                className="form-control form-control-lg bg-light border-0 pe-5"
                                                placeholder="Leave empty to keep current"
                                                value={editData.new_password}
                                                onChange={(e) => setEditData({ ...editData, new_password: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none"
                                                onClick={() => setShowAdminPassword(!showAdminPassword)}
                                                style={{ paddingRight: '15px' }}
                                            >
                                                <i className={`bi ${showAdminPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-3 px-4" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-3 px-4" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </>
                                        ) : 'Update Company'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyManagement;
