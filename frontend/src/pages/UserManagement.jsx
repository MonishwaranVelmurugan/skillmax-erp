import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { isSuperAdmin } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'BDE',
        email: '',
        company_id: 0
    });
    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isSuperAdmin()) {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
        fetchCompanies();
    }, [navigate]);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('companies/');
            setCompanies(response.data);
        } catch (err) {
            console.error('Failed to fetch companies:', err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('users/');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('users/', formData);
            setSuccess('User created successfully');
            setShowModal(false);
            setFormData({ username: '', password: '', role: 'BDE', email: '', company_id: 0 });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user');
        }
    };

    const handleDelete = async (id, username) => {
        if (username === 'ADMIN' || username === 'SUPERADMIN') {
            alert('Cannot delete core admin users');
            return;
        }
        if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            try {
                await api.delete(`users/${id}/`);
                setSuccess('User deleted successfully');
                fetchUsers();
            } catch (err) {
                setError('Failed to delete user');
            }
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.put(`users/${id}/role/`, { role: newRole });
            setSuccess('Role updated successfully');
            fetchUsers();
        } catch (err) {
            setError('Failed to update role');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading users...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">User Management</h3>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-person-plus me-2"></i> Add New User
                </button>
            </div>

            {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>}
            {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>}

            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Company</th>
                                <th>Created Date</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                <i className="bi bi-person text-primary"></i>
                                            </div>
                                            <span className="fw-medium">{user.username}</span>
                                        </div>
                                    </td>
                                    <td>{user.email || 'N/A'}</td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm w-auto border-0 bg-light fw-bold text-uppercase"
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            disabled={user.username === 'ADMIN' || user.username === 'SUPERADMIN'}
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            <option value="SUPERADMIN">Super Admin</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="BDE">BDE</option>
                                            <option value="CRO">CRO</option>
                                            <option value="CRE">CRE</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className="badge bg-info-subtle text-info fw-bold">
                                            {companies.find(c => c.id === user.company_id)?.company_name || (user.company_id === 0 ? 'ERPION' : 'Unknown')}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="text-end pe-4">
                                        <button
                                            className="btn btn-link text-danger p-0"
                                            onClick={() => handleDelete(user.id, user.username)}
                                            disabled={user.username === 'ADMIN' || user.username === 'SUPERADMIN'}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Create New User</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Username</label>
                                        <input type="text" name="username" className="form-control" required value={formData.username} onChange={handleInputChange} placeholder="e.g. bde_kavi" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Email</label>
                                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} placeholder="optional@example.com" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Password</label>
                                        <input type="password" name="password" className="form-control" required value={formData.password} onChange={handleInputChange} placeholder="••••••••" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Role</label>
                                        <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
                                            <option value="SUPERADMIN">Super Admin</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="BDE">BDE</option>
                                            <option value="CRO">CRO</option>
                                            <option value="CRE">CRE</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Company</label>
                                        <select name="company_id" className="form-select" value={formData.company_id} onChange={handleInputChange}>
                                            <option value="0">ERPION (Super Admin Control)</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.company_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Create User</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
