import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import studentService from '../services/studentService';
import '../components/certificate/Certificate.css';
import CertificateTemplate from '../components/certificate/CertificateTemplate';

const Certificate = () => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [noResult, setNoResult] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showTemplate, setShowTemplate] = useState(false);

    const abortControllerRef = useRef(null);

    // State reset on location change
    useEffect(() => {
        window.scrollTo(0, 0);
        setSearchQuery('');
        setResult(null);
        setNoResult(false);
        setShowConfirmModal(false);
        setShowSuccessModal(false);
        setShowTemplate(false);
    }, [location]);

    const handleSearch = async (query = searchQuery) => {
        const trimmed = query.trim();
        if (!trimmed) {
            setResult(null);
            setNoResult(false);
            return;
        }

        setIsLoading(true);
        setNoResult(false);
        // Do not clear 'result' immediately to avoid flickering

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            const students = await studentService.searchStudents(trimmed, abortControllerRef.current.signal);
            if (students && students.length > 0) {
                const found = {
                    ...students[0],
                    name: students[0].full_name,
                    id: students[0].student_id,
                    course: students[0].courses?.[0]?.course || students[0].courses?.[0]?.name || 'Professional Certification',
                    feeStatus: students[0].fee_status === 'Fully Paid' ? 'Fully Paid' : 'Partially Paid',
                    pendingAmount: students[0].pending_amount !== undefined ? Number(students[0].pending_amount) : Number(students[0].final_fee || 0),
                    certificateStatus: students[0].certificate_status || 'Needs to Apply',
                    certificateApplied: students[0].certificate_applied || false
                };
                setResult(found);
                setNoResult(false);
            } else {
                setResult(null);
                setNoResult(true);
            }
        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'CanceledError') return;
            console.error('Search error:', error);
            setNoResult(true);
            setResult(null);
        } finally {
            if (abortControllerRef.current?.signal?.aborted) return;
            setIsLoading(false);
        }
    };

    // Debounced search effect
    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleConfirm = () => {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
    };

    // Opens the premium template overlay
    const handleOpenTemplate = () => {
        setShowSuccessModal(false);
        setShowTemplate(true);
    };

    // Returns from template back to the Certificate page
    const handleCloseTemplate = () => {
        setShowTemplate(false);
    };

    // ── If the premium template is active, show it full-page ──
    if (showTemplate && result) {
        return (
            <CertificateTemplate
                student={result}
                onClose={handleCloseTemplate}
            />
        );
    }

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Search Section */}
            <div className={`mx-auto mb-5 premium-search-container ${result ? '' : 'py-5'}`} style={{ maxWidth: '700px' }}>
                {!result && (
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-dark">Certificate Issuance</h2>
                        <p className="text-muted">Enter student details to verify eligibility and generate professional certificates.</p>
                    </div>
                )}
                <div className="input-group input-group-lg shadow-sm">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                        <i className={`bi ${isLoading ? 'spinner-border spinner-border-sm' : 'bi-search'}`}></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 ps-0 shadow-none"
                        placeholder="Search by Name, Student ID or Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="btn btn-primary px-4 fw-bold"
                        onClick={handleSearch}
                        disabled={isLoading}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Split View Content */}
            {result && (
                <div className="row g-4 justify-content-center fade-in">
                    {/* Student Details & Eligibility */}
                    <div className="col-lg-6 col-xl-5">
                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                            <div className="bg-primary p-4 text-white">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-white text-primary rounded-circle p-2 me-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                        <i className="bi bi-person-badge fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-0 fw-bold">{result.name}</h5>
                                        <span className="opacity-75 small">{result.id}</span>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 flex-wrap">
                                    <span className={`badge rounded-pill px-3 py-2 ${result.feeStatus === 'Fully Paid' ? 'bg-success' : 'bg-warning'}`}>
                                        {result.feeStatus}
                                    </span>
                                    <span className={`badge rounded-pill px-3 py-2 ${result.certificateApplied ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                        {result.certificateApplied ? 'Applied' : 'Needs to Apply'}
                                    </span>
                                </div>
                            </div>

                            <div className="card-body p-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-12">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Enrolled Course</div>
                                        <div className="fw-medium text-dark">{result.course}</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Phone</div>
                                        <div className="fw-medium">{result.phone || 'N/A'}</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Email</div>
                                        <div className="fw-medium text-truncate">{result.email || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className={`card ${!result.certificateApplied ? 'bg-warning-subtle border-warning' : (result.feeStatus === 'Fully Paid' && Number(result.pendingAmount || 0) === 0 ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger')} p-3 mb-4 eligibility-status-card`}>
                                    <div className="d-flex align-items-start">
                                        <i className={`bi ${!result.certificateApplied ? 'bi-exclamation-circle-fill text-warning' : (result.feeStatus === 'Fully Paid' && Number(result.pendingAmount || 0) === 0 ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger')} fs-4 me-3`}></i>
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                {!result.certificateApplied ? 'Needs to Apply for Certificate' : (result.feeStatus === 'Fully Paid' && Number(result.pendingAmount || 0) === 0 ? 'Eligible for Certificate' : 'Ineligible')}
                                            </h6>
                                            <p className="small mb-0 opacity-75">
                                                {!result.certificateApplied
                                                    ? 'The student has not applied for the certificate yet.'
                                                    : (result.feeStatus === 'Fully Paid' && Number(result.pendingAmount || 0) === 0
                                                        ? 'All requirements are met. You can now generate the official certificate.'
                                                        : `Certificate cannot be issued until all pending fees are cleared.${Number(result.pendingAmount || 0) > 0 ? ` Pending Balance: ₹${Number(result.pendingAmount).toLocaleString()}` : ''}`)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {result.certificateApplied && result.feeStatus === 'Fully Paid' && Number(result.pendingAmount || 0) === 0 && (
                                    <button
                                        className="btn btn-primary btn-generate w-100 py-3 rounded-3"
                                        onClick={() => setShowConfirmModal(true)}
                                    >
                                        <i className="bi bi-award-fill me-2"></i>Generate Certificate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {noResult && (
                <div className="text-center py-5 fade-in">
                    <div className="mb-4">
                        <i className="bi bi-search" style={{ fontSize: '4rem', color: '#e2e8f0' }}></i>
                    </div>
                    <h4 className="fw-bold">No Student Found</h4>
                    <p className="text-muted">We couldn't find any student matching your search criteria.</p>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-body text-center p-5">
                                <div className="text-primary fs-1 mb-4">
                                    <i className="bi bi-shield-check"></i>
                                </div>
                                <h3 className="fw-bold mb-3">Final Verification</h3>
                                <p className="text-muted mb-4">Are you sure the certificate details for <strong>{result?.name}</strong> are correct? This action will finalize the issuance.</p>

                                <div className="d-flex gap-3 mt-4">
                                    <button className="btn btn-light flex-fill py-3 fw-bold" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                                    <button className="btn btn-primary flex-fill py-3 fw-bold" onClick={handleConfirm}>Confirm & Issue</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content overflow-hidden border-0 shadow-lg rounded-4">
                            <div className="modal-body text-center p-5">
                                <div className="mb-4">
                                    <div className="bg-success text-white rounded-circle d-inline-flex p-4 shadow-sm">
                                        <i className="bi bi-award fs-1"></i>
                                    </div>
                                </div>
                                <h2 className="fw-bold mb-2">Successfully Issued!</h2>
                                <p className="text-muted mb-4">The certificate for <strong>{result?.name}</strong> has been generated and is ready for download.</p>

                                <div className="d-grid gap-2">
                                    <button className="btn btn-success py-3 fw-bold rounded-3" onClick={handleOpenTemplate}>
                                        <i className="bi bi-award-fill me-2"></i>View &amp; Download Certificate
                                    </button>
                                    <button className="btn btn-link text-muted" onClick={() => setShowSuccessModal(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificate;

