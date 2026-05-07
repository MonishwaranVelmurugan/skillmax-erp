import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { isAdmin, getCurrentUser } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        role: 'BDE',
        status: 'Active'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const user = getCurrentUser();
        if (localStorage.getItem('role') !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('staff-users/');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load staff users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenCreate = () => {
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            password: '',
            confirm_password: '',
            role: 'BDE',
            status: 'Active'
        });
        setIsEdit(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowModal(true);
    };

    const handleOpenEdit = (user) => {
        setFormData({
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            password: '', // Password field is optional in edit
            confirm_password: '',
            role: user.role,
            status: user.status
        });
        setCurrentUserId(user.id);
        setIsEdit(true);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Password Validation
        if (isEdit) {
            if (formData.password || formData.confirm_password) {
                if (formData.password !== formData.confirm_password) {
                    setError('Passwords do not match');
                    return;
                }
                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return;
                }
            }
        } else {
            // Create validation
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
        }

        try {
            const payload = { ...formData };
            if (isEdit && !formData.password) {
                delete payload.password;
            }
            delete payload.confirm_password;

            if (isEdit) {
                await api.put(`staff-users/${currentUserId}/`, payload);
                setSuccess('User updated successfully');
            } else {
                await api.post('staff-users/', payload);
                setSuccess('User created successfully');
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} user`);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
            try {
                await api.delete(`staff-users/${id}/`);
                setSuccess('User deleted successfully');
                fetchUsers();
            } catch (err) {
                setError('Failed to delete user');
            }
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Manage Users</h3>
                    <p className="text-muted small mb-0">Manage your company's staff members and their access levels.</p>
                </div>
                <button className="btn btn-primary px-4" onClick={handleOpenCreate}>
                    <i className="bi bi-person-plus me-2"></i> Create User
                </button>
            </div>

            {error && <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>}
            {success && <div className="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>{success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>}

            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3">Staff Name</th>
                                <th className="py-3">Email Address</th>
                                <th className="py-3">Phone</th>
                                <th className="py-3">Role</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Created Date</th>
                                <th className="text-end pe-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        No staff users found. Click "Create User" to add one.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar-sm bg-primary-subtle rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                    <i className="bi bi-person text-primary fs-5"></i>
                                                </div>
                                                <span className="fw-bold">{user.full_name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'AM' ? 'bg-primary' : 'bg-info-subtle text-info'} fw-bold`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill ${user.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="text-end pe-4">
                                            <div className="btn-group shadow-sm rounded">
                                                <button className="btn btn-sm btn-white" onClick={() => handleOpenEdit(user)} title="Edit">
                                                    <i className="bi bi-pencil text-primary"></i>
                                                </button>
                                                <button className="btn btn-sm btn-white" onClick={() => handleDelete(user.id, user.full_name)} title="Delete">
                                                    <i className="bi bi-trash text-danger"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    {isEdit ? 'Edit User Details' : 'Create New Staff Member'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-bold">Full Name</label>
                                            <input type="text" name="full_name" className="form-control" required value={formData.full_name} onChange={handleInputChange} placeholder="Enter full name" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Email Address</label>
                                            <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleInputChange} placeholder="email@example.com" disabled={isEdit} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Phone Number</label>
                                            <input type="text" name="phone" className="form-control" required value={formData.phone} onChange={handleInputChange} placeholder="1234567890" />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Assigned Role</label>
                                            <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
                                                <option value="AM">AM (Account Manager)</option>
                                                <option value="CRO">CRO (Relationship Officer)</option>
                                                <option value="CRE">CRE (Relationship Executive)</option>
                                                <option value="BDE">BDE (Development Executive)</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Account Status</label>
                                            <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                                                <option value="Active">Active</option>
                                                <option value="Disabled">Disabled</option>
                                            </select>
                                        </div>

                                        {/* Password Section */}
                                        <div className="col-12">
                                            <hr className="my-3" />
                                            <h6 className="fw-bold mb-3">{isEdit ? 'Update Password (Optional)' : 'Security Credentials'}</h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">{isEdit ? 'New Password' : 'Password'}</label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    className="form-control"
                                                    required={!isEdit}
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Confirm Password</label>
                                            <div className="input-group">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirm_password"
                                                    className="form-control"
                                                    required={formData.password.length > 0}
                                                    value={formData.confirm_password}
                                                    onChange={handleInputChange}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">
                                        {isEdit ? 'Update User' : 'Create User'}
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

export default ManageUsers;
