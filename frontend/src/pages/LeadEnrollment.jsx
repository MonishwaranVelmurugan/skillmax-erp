import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { canModifyAssignedTo } from '../utils/auth';

const LeadEnrollment = () => {
    const location = useLocation();
    const role = localStorage.getItem("role") || '';
    const [assignedTo, setAssignedTo] = useState("");

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        full_name: '',
        email: '',
        assigned_to: '',
        education: '',
        work_experience: 'Fresher',
        phone_number: '',
        lead_source: '',
        lead_status: 'New',
        next_follow_up_date: '',
        course_interested: '',
        remarks: ''
    });

    const [validated, setValidated] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [canModifyRole] = useState(canModifyAssignedTo());

    useEffect(() => {
        if (role) {
            setAssignedTo(role);
            setFormData(prev => ({ ...prev, assigned_to: role }));
        }
    }, [role]);

    // State reset on location change
    useEffect(() => {
        window.scrollTo(0, 0);
        handleReset();
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Only numeric input for phone number (max 10)
        if (name === 'phone_number') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExperienceChange = (e) => {
        setFormData(prev => ({
            ...prev,
            work_experience: e.target.value === 'fresher' ? 'Fresher' : 'Experienced'
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setError(null);
        setShowSuccess(false);

        if (form.checkValidity() === false || formData.phone_number.length !== 10) {
            e.stopPropagation();
            setValidated(true);
            if (formData.phone_number.length !== 10) {
                setError("Phone number must be exactly 10 digits.");
            }
            return;
        }

        setIsLoading(true);
        try {
            // Map frontend fields to backend model fields
            const submissionData = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone_number,
                assigned_to: assignedTo,
                education: formData.education,
                work_experience: formData.work_experience,
                next_follow_up_date: formData.next_follow_up_date || null,
                course_interested: formData.course_interested,
                status: formData.lead_status,
                source: formData.lead_source,
                remarks: formData.remarks
            };

            const response = await api.post('leads/', submissionData);
            console.log('Lead enrolled:', response.data);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
            handleReset();
            window.scrollTo(0, 0);
        } catch (err) {
            console.error('Failed to enroll lead:', err);

            let displayError = "Something went wrong. Please try again.";

            if (err.response) {
                const contentType = err.response.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    const data = err.response.data;
                    if (typeof data === 'object') {
                        // Extract standard DRF validation errors
                        const errorDetails = Object.entries(data)
                            .map(([field, msgs]) => {
                                const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
                                const messages = Array.isArray(msgs) ? msgs.join(' ') : msgs;
                                return `${fieldName}: ${messages}`;
                            })
                            .join(' | ');
                        displayError = errorDetails || "Invalid data provided.";
                    } else {
                        displayError = data.toString();
                    }
                } else if (err.response.status === 401) {
                    displayError = "Session expired. Please log in again.";
                } else if (err.response.status === 403) {
                    displayError = "You do not have permission to perform this action.";
                }
            } else if (err.request) {
                displayError = "No response from server. Check your connection.";
            }

            setError(displayError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setValidated(false);
        setAssignedTo(role || "");
        setFormData({
            date: new Date().toISOString().split('T')[0],
            full_name: '',
            email: '',
            assigned_to: role || "",
            education: '',
            work_experience: 'Fresher',
            phone_number: '',
            lead_source: '',
            lead_status: 'New',
            next_follow_up_date: '',
            course_interested: '',
            remarks: ''
        });
    };

    return (
        <div className="fade-in">
            <div className="card card-custom p-0 overflow-hidden">
                <div className="card-header-clean p-4 border-bottom bg-white">
                    <h4 className="fw-bold mb-1">New Lead Enrollment</h4>
                    <p className="text-muted mb-0">Fill in the details to register a new lead into the system.</p>
                </div>
                <div className="card-body p-4 p-lg-5">

                    {showSuccess && (
                        <div
                            className="alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translates-middle-x m-3 shadow-lg"
                            style={{ zIndex: 1050, minWidth: '300px' }}
                            role="alert"
                        >
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <strong>Success!</strong> Lead details have been successfully enrolled in MySQL.
                            <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>Error!</strong> {error}
                            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                        </div>
                    )}

                    <form className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate onSubmit={handleSubmit} onReset={handleReset}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label">Date</label>
                                <input type="date" className="form-control" name="date" value={formData.date} readOnly />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Full Name<span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter lead's full name"
                                    required
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Email<span className="text-danger">*</span></label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Enter lead's email"
                                    required
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <div className="invalid-feedback">
                                    Please provide a valid email address.
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Assigned to<span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    required
                                    name="assigned_to"
                                    value={assignedTo}
                                    onChange={(e) => {
                                        setAssignedTo(e.target.value);
                                        handleChange(e);
                                    }}
                                    disabled={!canModifyRole}
                                >
                                    <option value="" disabled>Choose...</option>
                                    <option value="CRE">CRE</option>
                                    <option value="CRO">CRO</option>
                                    <option value="CRO-1">CRO-1</option>
                                    <option value="CRO-2">CRO-2</option>
                                    <option value="BDE">BDE</option>
                                    <option value="AM">AM</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                                {!canModifyRole && (
                                    <small className="text-muted">Auto-assigned to your role</small>
                                )}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Education<span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    required
                                    name="education"
                                    value={formData.education}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Choose...</option>
                                    <option value="SSLC">SSLC</option>
                                    <option value="HSC">HSC</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="UG">UG</option>
                                    <option value="PG">PG</option>
                                    <option value="PhD">PhD</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Work Experience</label>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="form-check me-4">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="experienceRadio"
                                            id="fresher"
                                            value="fresher"
                                            checked={formData.work_experience === 'Fresher'}
                                            onChange={handleExperienceChange}
                                        />
                                        <label className="form-check-label" htmlFor="fresher">Fresher</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="experienceRadio"
                                            id="experienced"
                                            value="experienced"
                                            checked={formData.work_experience === 'Experienced'}
                                            onChange={handleExperienceChange}
                                        />
                                        <label className="form-check-label" htmlFor="experienced">Experienced</label>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Phone Number<span className="text-danger">*</span></label>
                                <div className="input-group has-validation">
                                    <span className="input-group-text bg-light">+91</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="9876543210"
                                        required
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        onKeyPress={(e) => {
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <div className="invalid-feedback">
                                        Phone number must be exactly 10 digits.
                                    </div>
                                </div>
                                {validated && formData.phone_number.length !== 10 && (
                                    <div className="text-danger small mt-1">Phone number must be exactly 10 digits.</div>
                                )}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Lead Source</label>
                                <select
                                    className="form-select"
                                    name="lead_source"
                                    value={formData.lead_source}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Choose...</option>
                                    <option value="Meta Ads">Meta Ads</option>
                                    <option value="Telephonic">Telephonic</option>
                                    <option value="Organics">Organics</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Lead Status</label>
                                <select
                                    className="form-select"
                                    name="lead_status"
                                    value={formData.lead_status}
                                    onChange={handleChange}
                                >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Follow-up">Follow-up</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Dropped">Dropped</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Next Follow-up Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="next_follow_up_date"
                                    value={formData.next_follow_up_date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Course Interested</label>
                                <select
                                    className="form-select"
                                    name="course_interested"
                                    value={formData.course_interested}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Choose course...</option>
                                    <option value="Automation">Automation</option>
                                    <option value="Embedded">Embedded</option>
                                    <option value="Full Stack">Full Stack</option>
                                    <option value="Automation + Embedded">Automation + Embedded</option>
                                    <option value="Digital Marketing">Digital Marketing</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="form-label">Remarks</label>
                                <textarea
                                    className="form-control"
                                    name="remarks"
                                    rows="3"
                                    placeholder="Enter any additional details or notes about this lead..."
                                    value={formData.remarks}
                                    onChange={handleChange}
                                />
                                <small className="text-muted">Optional: Add any manual entry details or notes</small>
                            </div>

                            <div className="col-12 mt-4">
                                <button type="submit" className="btn btn-primary px-4 me-2" disabled={isLoading}>
                                    {isLoading ? 'Enrolling...' : 'Confirm Enrollment'}
                                </button>
                                <button type="reset" className="btn btn-outline-secondary px-4">Reset</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeadEnrollment;
