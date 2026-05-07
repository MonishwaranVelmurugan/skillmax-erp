import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentCertificate = () => {
    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCert = async () => {
            try {
                const response = await api.get('student/certificate/');
                setCert(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCert();
    }, []);

    if (loading) return <div className="p-5 text-center">Checking Certificate Status...</div>;

    return (
        <div className="certificate-page">
            <h3 className="fw-bold mb-4">Certification & Achievements</h3>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden text-center bg-white">
                <div className="p-5">
                    <div className="certificate-icon-wrapper mb-4">
                        <div className={`rounded-circle d-inline-flex p-4 ${cert?.has_certificate ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                            <i className={`bi bi-patch-check fs-1 ${cert?.has_certificate ? 'text-success' : 'text-muted'}`}></i>
                        </div>
                    </div>

                    <h2 className="fw-bold mb-2">{cert?.has_certificate ? 'Congratulations!' : 'Almost There!'}</h2>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '450px' }}>
                        {cert?.has_certificate
                            ? 'Your official course completion certificate has been generated and is ready for download.'
                            : 'Your certificate will be generated automatically once you complete all modules and clear the final assessment.'}
                    </p>

                    <div className="status-badge-container mb-4">
                        <span className={`badge rounded-pill px-4 py-2 fs-6 ${cert?.has_certificate ? 'bg-success text-white' : 'bg-warning-subtle text-warning border border-warning'}`}>
                            Status: {cert?.status || 'In Progress'}
                        </span>
                    </div>

                    {cert?.has_certificate ? (
                        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                            <button className="btn btn-primary px-5 py-3 rounded-pill fw-bold">
                                <i className="bi bi-download me-2"></i> Download Certificate (PDF)
                            </button>
                            <button className="btn btn-outline-primary px-5 py-3 rounded-pill fw-bold">
                                <i className="bi bi-share me-2"></i> Add to LinkedIn
                            </button>
                        </div>
                    ) : (
                        <div className="bg-light p-4 rounded-4 border border-dashed text-muted mt-4">
                            <i className="bi bi-info-circle me-2"></i>
                            Certificate Not Generated Yet
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-5">
                <h5 className="fw-bold mb-4">Course Highlights for Certification</h5>
                <div className="row g-3">
                    <div className="col-md-4">
                        <div className="p-3 bg-white shadow-sm rounded-3 d-flex align-items-center">
                            <i className="bi bi-check2-circle text-success me-3 fs-3"></i>
                            <div>
                                <div className="fw-bold small">Curriculum</div>
                                <div className="text-muted extra-small">100% Completed</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-white shadow-sm rounded-3 d-flex align-items-center">
                            <i className="bi bi-display text-primary me-3 fs-3"></i>
                            <div>
                                <div className="fw-bold small">Attendance</div>
                                <div className="text-muted extra-small">85% Required</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-white shadow-sm rounded-3 d-flex align-items-center">
                            <i className="bi bi-laptop text-info me-3 fs-3"></i>
                            <div>
                                <div className="fw-bold small">Final Project</div>
                                <div className="text-muted extra-small">Verified</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentCertificate;
