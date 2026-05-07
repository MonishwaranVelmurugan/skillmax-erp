import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const StudentLogin = () => {
    const navigate = useNavigate();
    const [institutes, setInstitutes] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingInstitutes, setFetchingInstitutes] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInstitutes = async () => {
            try {
                const response = await api.get('public/institutes/');
                setInstitutes(response.data);
                if (response.data.length > 0) {
                    setSelectedTenant(response.data[0].tenant_db);
                }
            } catch (err) {
                console.error('Failed to fetch institutes:', err);
                setError('Could not load institute list. Please refresh.');
            } finally {
                setFetchingInstitutes(false);
            }
        };
        fetchInstitutes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('student-login/', {
                tenant: selectedTenant,
                email,
                dob
            });

            // Store Auth Data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', 'STUDENT');
            localStorage.setItem('a3_campus_user', JSON.stringify({
                ...response.data.student,
                role: 'STUDENT',
                database_name: response.data.tenant_db
            }));

            navigate('/student/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Invalid Credentials for the selected institute.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3" style={{ background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)' }}>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="bg-primary p-4 text-center text-white">
                    <i className="bi bi-mortarboard fs-1 mb-2"></i>
                    <h3 className="fw-bold mb-0">Student Portal</h3>
                    <p className="opacity-75 small mb-0">ERPION Institute Management System</p>
                </div>
                <div className="card-body p-4 p-md-5">
                    {error && (
                        <div className="alert alert-danger border-0 small mb-4 py-2 d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold small text-muted text-uppercase mb-1">Select Institute</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-building text-muted"></i></span>
                                <select
                                    className="form-select border-start-0 ps-0"
                                    value={selectedTenant}
                                    onChange={(e) => setSelectedTenant(e.target.value)}
                                    disabled={fetchingInstitutes}
                                    required
                                >
                                    {fetchingInstitutes ? (
                                        <option>Loading institutes...</option>
                                    ) : (
                                        institutes.map(inst => (
                                            <option key={inst.id} value={inst.tenant_db}>
                                                {inst.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-muted text-uppercase mb-1">Email Address</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                                <input
                                    type="email"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-muted text-uppercase mb-1">Date of Birth</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-calendar-event text-muted"></i></span>
                                <input
                                    type="date"
                                    className="form-control border-start-0 ps-0"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm transition-all position-relative overflow-hidden" disabled={loading || fetchingInstitutes}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Access My Portal <i className="bi bi-arrow-right ms-1"></i>
                                </>
                            )}
                        </button>

                        <div className="text-center mt-4 pt-2 border-top">
                            <button type="button" onClick={() => navigate('/')} className="btn btn-link btn-sm text-decoration-none text-muted">
                                <i className="bi bi-house me-1"></i> Back to Institute Website
                            </button>
                        </div>
                    </form>
                </div>
                <div className="bg-light p-3 text-center">
                    <div className="extra-small text-muted" style={{ fontSize: '0.7rem' }}>
                        © 2026 Erpion ERP. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
