import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, getElementAtEvent } from 'react-chartjs-2';
import reportService from '../services/reportService';
import { getCurrentUserRole } from '../utils/auth';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const BASE_URL = 'http://localhost:8000';

const Reports = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const chartRef = useRef();
    const [filter, setFilter] = useState('Month');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '', filterLabel: '' });
    const [loading, setLoading] = useState(true);
    const role = getCurrentUserRole();

    const [stats, setStats] = useState({
        kpis: {
            collected: 0,
            collected_formatted: '₹ 0',
            pending: 0,
            pending_formatted: '₹ 0',
            pending_count: 0,
            revenue: 0,
            revenue_formatted: '₹ 0'
        },
        chart: {
            labels: [],
            data: []
        },
        transactions: [],
        pending_students: [],
        collected_students: [],
        revenue_students: [],
        course_breakdown: [],
        staff_breakdown: []
    });

    // State reset on location change
    useEffect(() => {
        window.scrollTo(0, 0);
        setFilter('Month');
        setModalConfig({ isOpen: false, type: '', title: '', filterLabel: '' });
    }, [location]);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                const data = await reportService.getReportStats(filter);
                if (data) setStats(data);
            } catch (error) {
                console.error('Error loading report stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [filter]);

    if (role !== "ADMIN" && role !== "AM" && role !== "SUPERADMIN") {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ height: '70vh' }}>
                <div className="text-center">
                    <i className="bi bi-shield-lock text-danger" style={{ fontSize: '4rem' }}></i>
                    <h3 className="mt-3">403 Unauthorized</h3>
                    <p className="text-muted">You do not have permission to view financial reports.</p>
                </div>
            </div>
        );
    }

    if (loading && !stats.kpis.revenue) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ height: '70vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <div className="mt-3 text-muted">Loading reports data...</div>
                </div>
            </div>
        );
    }

    const handleCardClick = (type, title) => {
        setModalConfig({ isOpen: true, type, title, filterLabel: '' });
    };

    const handleChartClick = (event) => {
        if (!chartRef.current) return;
        const elements = getElementAtEvent(chartRef.current, event);
        if (elements.length > 0) {
            const index = elements[0].index;
            const clickedLabel = stats.chart.labels[index];
            setModalConfig({ isOpen: true, type: 'chart_date', title: `Payments Details (${clickedLabel})`, filterLabel: clickedLabel });
        }
    };

    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Student,Course,Amount,Status,Date\n"
            + stats.revenue_students.map(e => `"${e.full_name}","${e.course}","${e.amount}","${e.status}","${e.date}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `financial_report_${filter}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const handleViewDetails = (studentId) => {
        // Navigate to student details page with the student ID
        // The student details page will be updated to handle auto-loading
        navigate('/students', { state: { autoSearch: studentId } });
    };

    const chartData = {
        labels: stats.chart.labels,
        datasets: [
            {
                label: 'Collections (₹)',
                data: stats.chart.data,
                borderColor: 'rgb(13, 110, 253)',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Important for height control
        plugins: {
            legend: { position: 'top' },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <div className="fade-in">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold mb-0">Financial Reports</h3>
                    <p className="text-muted small mb-0">Track fee collections and pending dues.</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => window.open(`${BASE_URL}/api/reports/export/students/`)}
                        >
                            <i className="bi bi-people me-1"></i> Export Students Excel
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => window.open(`${BASE_URL}/api/reports/export/payments/`)}
                        >
                            <i className="bi bi-wallet2 me-1"></i> Export Payments Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card card-custom mb-4 p-3">
                <div className="d-flex gap-2 flex-wrap">
                    {['Day', 'Week', 'Month', 'Year'].map(f => (
                        <button
                            key={f}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-outline-secondary'} report-filter-btn`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div
                        className="card card-custom p-4 border-start border-4 border-success"
                        onClick={() => handleCardClick('collected', 'Collected Fees')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-3 mb-3" style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-cash-stack fs-4"></i>
                        </div>
                        <h6 className="text-muted fw-semibold">Collected Fees</h6>
                        <h3 className="fw-bold mb-1">{stats?.kpis?.collected_formatted ?? '₹ 0'}</h3>
                        <div className="small text-success mt-2">
                            <i className="bi bi-arrow-up-short"></i> <span>In Selected Period</span>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div
                        className="card card-custom p-4 border-start border-4 border-warning"
                        onClick={() => handleCardClick('pending', 'Students with Pending Payments')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="d-flex align-items-center justify-content-center bg-warning-subtle text-warning rounded-3 mb-3" style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-hourglass-split fs-4"></i>
                        </div>
                        <h6 className="text-muted fw-semibold">Pending Amount</h6>
                        <h3 className="fw-bold mb-1">{stats?.kpis?.pending_formatted ?? '₹ 0'}</h3>
                        <div className="small text-muted mt-2">
                            From <span>{stats?.kpis?.pending_count ?? 0}</span> students
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div
                        className="card card-custom p-4 border-start border-4 border-primary"
                        onClick={() => handleCardClick('revenue', 'Total Net Revenue')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-3 mb-3" style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-graph-up-arrow fs-4"></i>
                        </div>
                        <h6 className="text-muted fw-semibold">Total Net Revenue</h6>
                        <h3 className="fw-bold mb-1">{stats?.kpis?.revenue_formatted ?? '₹ 0'}</h3>
                        <div className="small text-primary mt-2">
                            <span>Projected Revenue</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Chart Area */}
                <div className="col-lg-8">
                    <div className="card card-custom p-4">
                        <h5 className="fw-bold mb-4">Fee Collection Trends</h5>
                        <div style={{ position: 'relative', height: '300px' }}>
                            <Line ref={chartRef} data={chartData} options={chartOptions} onClick={handleChartClick} />
                        </div>
                    </div>
                </div>
                {/* Breakdowns Area */}
                <div className="col-lg-4 d-flex flex-column gap-4">
                    {/* Course Breakdown */}
                    <div className="card card-custom p-4 flex-fill">
                        <h6 className="fw-bold mb-3">Revenue by Course</h6>
                        <div className="table-responsive">
                            <table className="table table-sm align-middle mb-0">
                                <tbody>
                                    {stats.course_breakdown?.slice(0, 5).map((c, idx) => (
                                        <tr key={idx}>
                                            <td className="small">{c.course}</td>
                                            <td className="text-end fw-bold small">₹ {c.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {!stats.course_breakdown?.length && <tr><td className="text-muted small">No data available</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Staff Breakdown */}
                    <div className="card card-custom p-4 flex-fill">
                        <h6 className="fw-bold mb-3">Revenue by Staff</h6>
                        <div className="table-responsive">
                            <table className="table table-sm align-middle mb-0">
                                <tbody>
                                    {stats.staff_breakdown?.slice(0, 5).map((s, idx) => (
                                        <tr key={idx}>
                                            <td className="small">{s.staff}</td>
                                            <td className="text-end fw-bold small text-primary">₹ {s.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {!stats.staff_breakdown?.length && <tr><td className="text-muted small">No data available</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unified Data Modal */}
            {modalConfig.isOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                    <div className="modal-dialog modal-dialog-centered modal-xl" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg rounded-4" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header border-0 pb-3 px-4 pt-4 flex-shrink-0">
                                <h5 className="modal-title fw-bold">{modalConfig.title}</h5>
                                <button type="button" className="btn-close shadow-none" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}></button>
                            </div>
                            <div className="modal-body p-0" style={{ overflowY: 'auto' }}>
                                <div className="px-4 pb-4">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light sticky-top shadow-sm" style={{ zIndex: 1, top: 0 }}>
                                            <tr>
                                                <th className="small fw-bold">Student Name</th>
                                                <th className="small fw-bold">Course</th>
                                                {modalConfig.type === 'pending' ? (
                                                    <>
                                                        <th className="small fw-bold text-end">Total Fee</th>
                                                        <th className="small fw-bold text-end">Paid Amount</th>
                                                        <th className="small fw-bold text-end">Pending</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="small fw-bold text-end">Amount Paid / Fee</th>
                                                        <th className="small fw-bold">Status</th>
                                                        <th className="small fw-bold">Date</th>
                                                    </>
                                                )}
                                                <th className="small fw-bold text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                let dataList = [];
                                                if (modalConfig.type === 'pending') dataList = stats.pending_students;
                                                else if (modalConfig.type === 'collected') dataList = stats.collected_students;
                                                else dataList = stats.revenue_students; // Default to all revenue items

                                                if (modalConfig.filterLabel) {
                                                    // Quick filter to vaguely match chart labels (Day/Month/Year formats)
                                                    dataList = dataList.filter(item => {
                                                        const d = new Date(item.date);
                                                        const dateStr = d.toDateString();
                                                        return dateStr.includes(modalConfig.filterLabel) || d.toLocaleDateString().includes(modalConfig.filterLabel) || item.date.includes(modalConfig.filterLabel);
                                                    }).concat(dataList.filter(item => !modalConfig.filterLabel)); // Fallback show all if strict matching fails
                                                }

                                                if (!dataList || dataList.length === 0) {
                                                    return <tr><td colSpan="7" className="text-center py-4 text-muted">No records found for this selection.</td></tr>;
                                                }

                                                return dataList.map((s, idx) => (
                                                    <tr key={idx}>
                                                        <td className="small">
                                                            <div className="fw-bold">{s.full_name}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{s.student_id}</div>
                                                        </td>
                                                        <td className="small">{s.course}</td>

                                                        {modalConfig.type === 'pending' ? (
                                                            <>
                                                                <td className="small text-end">₹ {s.final_fee?.toLocaleString()}</td>
                                                                <td className="small text-end text-success">₹ {s.paid_amount?.toLocaleString()}</td>
                                                                <td className="small text-end text-danger fw-bold">₹ {s.pending_amount?.toLocaleString()}</td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="small text-end fw-bold">₹ {s.amount?.toLocaleString()}</td>
                                                                <td className="small"><span className={`badge ${s.status === 'Fully Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>{s.status || 'Paid'}</span></td>
                                                                <td className="small">{s.date}</td>
                                                            </>
                                                        )}
                                                        <td className="small text-center">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                                                onClick={() => handleViewDetails(s.student_id)}
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
