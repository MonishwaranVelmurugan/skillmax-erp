import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentCourse = () => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get('student/course/');
                setCourse(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, []);

    if (loading) return <div className="p-5 text-center">Loading Course Details...</div>;

    return (
        <div className="course-page">
            <h3 className="fw-bold mb-4">My Enrolled Course</h3>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="bg-primary p-5 text-white position-relative overflow-hidden">
                    <div className="position-relative z-1">
                        <span className="badge bg-white text-primary mb-2 px-3 py-2 rounded-pill">Active Program</span>
                        <h1 className="fw-bold mb-1">{course?.course_name}</h1>
                        <p className="opacity-75 lead mb-0">Professional Certification Track</p>
                    </div>
                    <i className="bi bi-mortarboard position-absolute text-white opacity-10" style={{ fontSize: '12rem', right: '-2rem', bottom: '-3rem' }}></i>
                </div>
                <div className="card-body p-4 p-md-5">
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center p-3 border rounded-3 h-100">
                                <div className="bg-light rounded-circle p-3 me-3">
                                    <i className="bi bi-clock-history text-primary fs-3"></i>
                                </div>
                                <div>
                                    <div className="text-muted small">Batch Timing</div>
                                    <div className="fw-bold">{course?.batch_timing}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex align-items-center p-3 border rounded-3 h-100">
                                <div className="bg-light rounded-circle p-3 me-3">
                                    <i className="bi bi-calendar-check text-success fs-3"></i>
                                </div>
                                <div>
                                    <div className="text-muted small">Course Duration</div>
                                    <div className="fw-bold">{course?.duration}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex align-items-center p-3 border rounded-3 h-100">
                                <div className="bg-light rounded-circle p-3 me-3">
                                    <i className="bi bi-person-workspace text-info fs-3"></i>
                                </div>
                                <div>
                                    <div className="text-muted small">Assigned Trainer</div>
                                    <div className="fw-bold">{course?.trainer}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex align-items-center p-3 border rounded-3 h-100">
                                <div className="bg-light rounded-circle p-3 me-3">
                                    <i className="bi bi-geo-alt text-danger fs-3"></i>
                                </div>
                                <div>
                                    <div className="text-muted small">Learning Mode</div>
                                    <div className="fw-bold">Blended (On-campus + Live Only)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-top">
                        <h5 className="fw-bold mb-4">Module Progress</h5>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-3">
                                <div>
                                    <h6 className="mb-0 fw-bold">Module 1: Foundations & Prerequisites</h6>
                                    <small className="text-muted">Completed on Feb 15, 2026</small>
                                </div>
                                <span className="badge bg-success rounded-pill px-3 py-2"><i className="bi bi-check2 me-1"></i> Completed</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-3">
                                <div>
                                    <h6 className="mb-0 fw-bold">Module 2: Core Advanced Concepts</h6>
                                    <small className="text-muted">Currently Active</small>
                                </div>
                                <span className="badge bg-primary rounded-pill px-3 py-2">Ongoing</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-3">
                                <div>
                                    <h6 className="mb-0 fw-bold text-muted">Module 3: Final Project & Assessment</h6>
                                    <small className="text-muted">Starting in 2 weeks</small>
                                </div>
                                <span className="badge bg-light text-muted border rounded-pill px-3 py-2">Locked</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentCourse;
