import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StudentDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('student/dashboard/');
                setStats(response.data);
            } catch (err) {
                setError('Failed to load dashboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="dashboard-content">
            <div className="welcome-section mb-4">
                <h2 className="fw-bold mb-1 text-dark">Hello, {stats?.name}!</h2>
                <p className="text-muted">Welcome back to your academic overview. Here's what's happening today.</p>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-primary">
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                                <i className="bi bi-person-badge text-primary fs-5"></i>
                            </div>
                            <div>
                                <div className="text-muted extra-small">Roll Number</div>
                                <div className="fw-bold small">{stats?.roll_no}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-success">
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                                <i className="bi bi-wallet2 text-success fs-5"></i>
                            </div>
                            <div>
                                <div className="text-muted extra-small">Fee Status</div>
                                <div className={`fw-bold extra-small ${stats?.fee_status === 'Pending' ? 'text-danger' : 'text-success'}`}>
                                    {stats?.fee_status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-info">
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                                <i className="bi bi-book text-info fs-5"></i>
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-muted extra-small">Course & Batch</div>
                                <div className="fw-bold extra-small text-truncate">{stats?.course}</div>
                                <div className="extra-small text-muted text-truncate">{stats?.batch}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-warning">
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                                <i className="bi bi-person-workspace text-warning fs-5"></i>
                            </div>
                            <div>
                                <div className="text-muted extra-small">Trainer</div>
                                <div className="fw-bold extra-small">{stats?.trainer}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-secondary">
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-secondary bg-opacity-10 p-2 me-3">
                                <i className="bi bi-patch-check text-secondary fs-5"></i>
                            </div>
                            <div>
                                <div className="text-muted extra-small">Certificate</div>
                                <div className="fw-bold extra-small">{stats?.certificate_status || 'In Progress'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                        <div className="card-header bg-white border-0 py-3 px-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">My Course Roadmap</h5>
                                <Link to="/student/course" className="btn btn-sm btn-light rounded-pill px-3">View Syllabus</Link>
                            </div>
                        </div>
                        <div className="card-body p-4 pt-0">
                            <div className="course-card-inner p-3 bg-light rounded-3 d-flex align-items-center">
                                <div className="flex-shrink-0 me-4">
                                    <div className="bg-primary text-white rounded-3 p-4">
                                        <i className="bi bi-mortarboard fs-1"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <h4 className="fw-bold text-primary mb-1">{stats?.course}</h4>
                                    <p className="text-muted mb-3 small">Enrolled Program • Comprehensive Training Module</p>
                                    <div className="progress rounded-pill mb-2" style={{ height: '8px' }}>
                                        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: '65%' }}></div>
                                    </div>
                                    <div className="d-flex justify-content-between extra-small text-muted">
                                        <span>Course Completion: 65%</span>
                                        <span>Remaining: 4 weeks</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white h-100">
                                <i className="bi bi-shield-check text-success fs-1 mb-2"></i>
                                <h6 className="fw-bold">Secured Payments</h6>
                                <p className="text-muted small px-3">Track all your transactions and fee history safely.</p>
                                <Link to="/student/payments" className="btn btn-outline-primary btn-sm rounded-pill px-4 mt-auto">History</Link>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white h-100">
                                <i className="bi bi-person-lines-fill text-info fs-1 mb-2"></i>
                                <h6 className="fw-bold">Personal Profile</h6>
                                <p className="text-muted small px-3">View and verify your registered academic details.</p>
                                <Link to="/student/profile" className="btn btn-outline-info btn-sm rounded-pill px-4 mt-auto">Manage</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-4 mb-4">
                        <h5 className="fw-bold mb-3">Finance Summary</h5>
                        <div className="mb-4">
                            <div className="opacity-75 small">Total Fees</div>
                            <div className="fs-3 fw-bold">₹ {stats?.final_fee}</div>
                        </div>
                        <div className="d-flex justify-content-between mb-2 pb-2 border-bottom border-white border-opacity-25">
                            <span>Paid Amount</span>
                            <span className="fw-bold text-white">₹ {stats?.total_paid}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-4">
                            <span>Balance Due</span>
                            <span className="fw-bold text-white">₹ {stats.final_fee - stats.total_paid}</span>
                        </div>
                        <Link to="/student/payments" className="btn btn-light w-100 fw-bold rounded-pill">Pay Now / history</Link>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h5 className="fw-bold mb-3">Upcoming Events</h5>
                        <div className="event-item d-flex mb-3">
                            <div className="date-badge bg-light rounded px-3 py-2 text-center me-3" style={{ minWidth: '70px' }}>
                                <div className="small fw-bold text-primary">MAR</div>
                                <div className="h5 fw-bold mb-0">15</div>
                            </div>
                            <div>
                                <div className="fw-bold small">Mock Interview</div>
                                <div className="text-muted extra-small">Technical Screening • 10:00 AM</div>
                            </div>
                        </div>
                        <div className="event-item d-flex">
                            <div className="date-badge bg-light rounded px-3 py-2 text-center me-3" style={{ minWidth: '70px' }}>
                                <div className="small fw-bold text-primary">MAR</div>
                                <div className="h5 fw-bold mb-0">22</div>
                            </div>
                            <div>
                                <div className="fw-bold small">Hackathon 2026</div>
                                <div className="text-muted extra-small">Campus Arena • 09:00 AM</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
