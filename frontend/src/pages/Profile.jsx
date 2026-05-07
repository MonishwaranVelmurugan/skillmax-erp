import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import storageService from '../services/storageService';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            setProfile(data);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to load profile details.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'danger', text: 'Passwords do not match.' });
            return;
        }

        if (passwordData.new_password.length < 6) {
            setMessage({ type: 'danger', text: 'New password must be at least 6 characters long.' });
            return;
        }

        setSubmitting(true);
        try {
            await authService.changePassword(passwordData.old_password, passwordData.new_password);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            setMessage({
                type: 'danger',
                text: error.response?.data?.error || 'Failed to change password. Please check your old password.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                                    <i className="bi bi-person-fill fs-3"></i>
                                </div>
                                <div>
                                    <h4 className="mb-0">{profile?.username}</h4>
                                    <span className="badge bg-soft-primary text-primary">{profile?.role}</span>
                                </div>
                            </div>

                            <div className="profile-info mt-4">
                                <div className="mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Email Address</label>
                                    <p className="mb-0 fw-medium">{profile?.email || 'N/A'}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Username</label>
                                    <p className="mb-0 fw-medium">{profile?.username}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Role</label>
                                    <p className="mb-0 fw-medium">{profile?.role}</p>
                                </div>
                                <div className="mb-0">
                                    <label className="text-muted small text-uppercase fw-bold">Last Login</label>
                                    <p className="mb-0 fw-medium">
                                        {profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'First login session'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-transparent border-0 pt-4 px-4">
                            <h5 className="mb-0">Change Password</h5>
                            <p className="text-muted small mb-0">Update your account security</p>
                        </div>
                        <div className="card-body p-4">
                            {message.text && (
                                <div className={`alert alert-${message.type} border-0 shadow-sm mb-4`} role="alert">
                                    <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2`}></i>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmitPassword}>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Current Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-shield-lock"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0 bg-light"
                                            name="old_password"
                                            value={passwordData.old_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-medium">New Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-key"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0 bg-light"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div className="form-text">Must be at least 6 characters.</div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-medium">Confirm New Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-key-fill"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0 bg-light"
                                            name="confirm_password"
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary py-2 fw-bold"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
