import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentPayments = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await api.get('student/payments/');
                setPaymentData(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return <div className="p-5 text-center">Loading Financial Data...</div>;

    return (
        <div className="payments-page">
            <h3 className="fw-bold mb-4">Financial Overview</h3>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                        <div className="text-muted small text-uppercase fw-bold mb-1">Total Fee</div>
                        <div className="h4 fw-bold mb-0 text-dark">₹ {paymentData?.total_fee}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                        <div className="text-muted small text-uppercase fw-bold mb-1">Scholarship / Disc.</div>
                        <div className="h4 fw-bold mb-0 text-info">₹ {paymentData?.discount}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-primary text-white">
                        <div className="opacity-75 small text-uppercase fw-bold mb-1">Final Payable</div>
                        <div className="h4 fw-bold mb-0">₹ {paymentData?.final_fee}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-success text-white">
                        <div className="opacity-75 small text-uppercase fw-bold mb-1">Total Paid</div>
                        <div className="h4 fw-bold mb-0">₹ {paymentData?.paid_amount}</div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-5 text-center">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="display-4 fw-bold text-danger mb-2">₹ {paymentData?.pending_amount}</div>
                            <div className="h5 fw-bold text-muted mb-4">Current Outstanding Balance</div>
                            {paymentData?.pending_amount > 0 ? (
                                <button className="btn btn-primary rounded-pill px-5 py-3 fw-bold">
                                    <i className="bi bi-credit-card me-2"></i> Pay Online Now
                                </button>
                            ) : (
                                <div className="badge bg-success-subtle text-success border border-success px-4 py-2 fs-6">
                                    <i className="bi bi-check-circle-fill me-2"></i> No Dues / Fully Paid
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <h5 className="fw-bold mb-3 mt-5">Payment History</h5>
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3">Receipt Info</th>
                                <th className="py-3">Date</th>
                                <th className="py-3">Method</th>
                                <th className="py-3 text-end pe-4">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentData?.history?.length > 0 ? (
                                paymentData.history.map((receipt, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded p-2 me-3">
                                                    <i className="bi bi-receipt"></i>
                                                </div>
                                                <span className="fw-bold">{receipt.receipt_number}</span>
                                            </div>
                                        </td>
                                        <td>{receipt.date}</td>
                                        <td>
                                            <span className="badge bg-light text-dark border px-3 py-1">{receipt.mode}</span>
                                        </td>
                                        <td className="text-end pe-4 fw-bold text-success">₹ {receipt.amount}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        No payment records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentPayments;
