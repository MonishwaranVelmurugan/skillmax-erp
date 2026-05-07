import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('student/profile/');
                setProfile(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-5 text-center">Loading Official Profile...</div>;

    return (
        <div className="profile-page">
            <h3 className="fw-bold mb-4">Official Student Profile</h3>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 text-center p-5 bg-white mb-4">
                        <div className="avatar-wrapper mb-3">
                            <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex p-4 border border-primary border-opacity-25">
                                <i className="bi bi-person-fill text-primary" style={{ fontSize: '4rem' }}></i>
                            </div>
                        </div>
                        <h4 className="fw-bold mb-1">{profile?.name}</h4>
                        <p className="text-muted small mb-3">Enrolled Student</p>
                        <div className="badge bg-light text-primary border px-3 py-2 rounded-pill mb-4">
                            ID: {profile?.roll_no}
                        </div>
                        <div className="pt-3 border-top w-100">
                            <div className="text-muted extra-small text-uppercase fw-bold mb-2">Academic Standing</div>
                            <div className="fw-bold text-success">Good (Verified)</div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h6 className="fw-bold mb-3">Important Documents</h6>
                        <div className="list-group list-group-flush">
                            <div className="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent">
                                <span><i className="bi bi-file-earmark-pdf me-2 text-danger"></i> Admission Form</span>
                                <button className="btn btn-link btn-sm p-0"><i className="bi bi-download"></i></button>
                            </div>
                            <div className="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent">
                                <span><i className="bi bi-file-earmark-image me-2 text-primary"></i> ID Proof</span>
                                <button className="btn btn-link btn-sm p-0"><i className="bi bi-eye"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0 fw-bold">Personal & Contact Information</h5>
                            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                                <i className="bi bi-pencil me-1"></i> Request Change
                            </button>
                        </div>

                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="text-muted extra-small text-uppercase fw-bold mb-1 d-block">Full Name</label>
                                <div className="fw-bold border-bottom pb-2">{profile?.name}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted extra-small text-uppercase fw-bold mb-1 d-block">Roll Number</label>
                                <div className="fw-bold border-bottom pb-2">{profile?.roll_no}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted extra-small text-uppercase fw-bold mb-1 d-block">Email Address</label>
                                <div className="fw-bold border-bottom pb-2">{profile?.email}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted extra-small text-uppercase fw-bold mb-1 d-block">Phone Number</label>
                                <div className="fw-bold border-bottom pb-2">{profile?.phone}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted extra-small text-uppercase fw-bold mb-1 d-block">Date of Birth</label>
                                <div className="fw-bold border-bottom pb-2">{profile?.dob}</div>
                            </div>
                            <div className="col-12">
                                <label className="text-muted extra-small text-uppercase fw-bold mb-1 d-block">Residential Address</label>
                                <div className="fw-bold border-bottom pb-2">{profile?.address || 'Not Provided'}</div>
                            </div>
                        </div>

                        <div className="alert alert-info mt-5 border-0 rounded-3 small">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            To update any official records, please contact the institute administration desk with valid documents.
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h5 className="fw-bold mb-3">Guardian Details</h5>
                        <div className="row g-3">
                            <div className="col-md-6 border-end">
                                <div className="p-2">
                                    <div className="text-muted small">Primary Guardian</div>
                                    <div className="fw-bold">Mr. S.P. {profile?.name?.split(' ').pop()}</div>
                                    <div className="extra-small text-muted mt-1">Contact: +91 98765 43210</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-2">
                                    <div className="text-muted small">Relationship</div>
                                    <div className="fw-bold">Father</div>
                                    <div className="extra-small text-muted mt-1">Occupation: Professional</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
