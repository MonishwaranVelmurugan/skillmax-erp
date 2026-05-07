import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useLocation, useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // State reset on location change
    useEffect(() => {
        window.scrollTo(0, 0);
        setModalConfig({ isOpen: false, type: '', title: '' });
        fetchStats();
    }, [location]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '' });
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCardClick = async (type, title) => {
        setModalConfig({ isOpen: true, type, title });
        setModalData([]);
        setModalLoading(true);
        setSearchTerm('');
        try {
            let endpoint = '';
            if (type === 'leads') endpoint = '/leads/?filter=all';
            else if (type === 'walkins') endpoint = '/leads/?filter=walkins';
            else if (type === 'registered') endpoint = '/students/?filter=registered';

            const response = await api.get(endpoint);
            setModalData(response.data);
        } catch (err) {
            console.error('Failed to fetch modal data:', err);
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading dashboard data...</div>;
    }

    if (!stats) {
        return <div className="p-4 text-center text-danger">Error loading dashboard data.</div>;
    }

    // Leads Bar Chart Data
    const leadsData = {
        labels: stats.trend.map(t => t.date),
        datasets: [{
            label: 'New Leads',
            data: stats.trend.map(t => t.count),
            backgroundColor: '#0d6efd',
            borderRadius: 6,
            barThickness: 20
        }]
    };

    const leadsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { borderDash: [5, 5] },
                ticks: {
                    precision: 0
                }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    // Source Doughnut Chart Data
    const bgColors = [
        '#0d6efd', // Primary Blue
        '#0dcaf0', // Info Cyan
        '#198754', // Success Green
        '#ffc107', // Warning Yellow
        '#6c757d', // Secondary Gray
        '#6610f2', // Indigo
        '#fd7e14', // Orange
    ];

    const sourceData = {
        labels: stats.sources.map(s => s.source || 'Unknown'),
        datasets: [{
            data: stats.sources.map(s => s.count),
            backgroundColor: bgColors,
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const sourceOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%', // Thinner ring
        plugins: {
            legend: { display: false }
        }
    };

    return (
        <div className="fade-in">
            {/* Row 1: Main KPIs */}
            <div className="row g-4 mb-4">
                {/* KPI 1: Total Leads */}
                <div className="col-xl-3 col-sm-6">
                    <div className="card card-custom stat-card" style={{ cursor: 'pointer' }} onClick={() => handleCardClick('leads', 'All Leads')}>
                        <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                            <i className="bi bi-people-fill"></i>
                        </div>
                        <div className="stat-value">{stats.kpis.total_leads.toLocaleString()}</div>
                        <div className="stat-label">Total Leads</div>
                    </div>
                </div>
                {/* KPI 2: Total Walk-in */}
                <div className="col-xl-3 col-sm-6">
                    <div className="card card-custom stat-card" style={{ cursor: 'pointer' }} onClick={() => handleCardClick('walkins', 'All Walk-ins')}>
                        <div className="stat-icon bg-success bg-opacity-10 text-success">
                            <i className="bi bi-person-walking"></i>
                        </div>
                        <div className="stat-value">{stats.kpis.total_walk_ins.toLocaleString()}</div>
                        <div className="stat-label">Total Walk-ins</div>
                    </div>
                </div>
                {/* KPI 3: Total Registered */}
                <div className="col-xl-3 col-sm-6">
                    <div className="card card-custom stat-card" style={{ cursor: 'pointer' }} onClick={() => handleCardClick('registered', 'All Registered Students')}>
                        <div className="stat-icon bg-info bg-opacity-10 text-info">
                            <i className="bi bi-person-check-fill"></i>
                        </div>
                        <div className="stat-value">{stats.kpis.total_registered.toLocaleString()}</div>
                        <div className="stat-label">Total Registered</div>
                    </div>
                </div>
                {/* KPI 4: Total Collection */}
                <div className="col-xl-3 col-sm-6">
                    <div className="card card-custom stat-card">
                        <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                            <i className="bi bi-wallet-fill"></i>
                        </div>
                        <div className="stat-value">{stats.kpis.total_collection_formatted}</div>
                        <div className="stat-label">Total Collection</div>
                    </div>
                </div>
            </div>

            {/* Row 2: Financial Overview */}
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="card card-custom stat-card d-flex flex-row align-items-center justify-content-between">
                        <div>
                            <div className="stat-label mb-1">Total Collected Amount</div>
                            <div className="stat-value text-success">₹ {stats.kpis.paid_amount.toLocaleString()}</div>
                        </div>
                        <div className="stat-icon bg-success bg-opacity-10 text-success mb-0">
                            <i className="bi bi-cash-stack"></i>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card card-custom stat-card d-flex flex-row align-items-center justify-content-between">
                        <div>
                            <div className="stat-label mb-1">Total Pending Collection</div>
                            <div className="stat-value text-danger">₹ {stats.kpis.pending_amount.toLocaleString()}</div>
                        </div>
                        <div className="stat-icon bg-danger bg-opacity-10 text-danger mb-0">
                            <i className="bi bi-hourglass-split"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Charts Section */}
            <div className="row g-4">
                {/* Left: Bar Chart (Leads Trend) */}
                <div className="col-lg-8">
                    <div className="card card-custom p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Lead Acquisition Trend (Last 7 Days)</h5>
                        </div>
                        <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                            <Bar data={leadsData} options={leadsOptions} />
                        </div>
                    </div>
                </div>

                {/* Right: Circular Progress / Source Breakdown */}
                <div className="col-lg-4">
                    <div className="card card-custom p-4 h-100">
                        <h5 className="fw-bold mb-4">Lead Sources And Counts</h5>
                        <div style={{ position: 'relative', height: '250px', width: '100%', marginBottom: '2rem' }}>
                            {stats.sources.length > 0 ? (
                                <Doughnut data={sourceData} options={sourceOptions} />
                            ) : (
                                <div className="text-center text-muted py-5">No source data available</div>
                            )}
                        </div>

                        {/* Source Breakdown List (Legend/Counts) */}
                        <div className="vstack gap-3 mt-auto">
                            {stats.sources.map((source, index) => {
                                const textColors = ['text-primary', 'text-info', 'text-success', 'text-warning', 'text-secondary', 'text-indigo', 'text-orange'];
                                return (
                                    <div className="d-flex justify-content-between align-items-center" key={source.source || 'Unknown'}>
                                        <div className="d-flex align-items-center gap-2">
                                            <i className={`bi bi-circle-fill ${textColors[index % textColors.length]}`} style={{ fontSize: '0.6rem' }}></i>
                                            <span className="small fw-medium">{source.source || 'Unknown'}</span>
                                        </div>
                                        <span className="fw-bold small">{source.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {modalConfig.isOpen && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
                            <div className="modal-header border-bottom px-4 py-3">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-table me-2 text-primary"></i>
                                    {modalConfig.title}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}></button>
                            </div>
                            <div className="modal-body p-4 bg-light">
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name, course, phone, or status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {modalLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <div className="mt-2 text-muted">Loading data...</div>
                                    </div>
                                ) : (
                                    <div className="table-responsive bg-white rounded shadow-sm border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    {modalConfig.type === 'registered' ? (
                                                        <>
                                                            <th>Student Name</th>
                                                            <th>Course</th>
                                                            <th>Batch</th>
                                                            <th>Fee Status</th>
                                                            <th>Admission Date</th>
                                                            <th>Action</th>
                                                        </>
                                                    ) : modalConfig.type === 'walkins' ? (
                                                        <>
                                                            <th>Lead Name</th>
                                                            <th>Visit Date</th>
                                                            <th>Course</th>
                                                            <th>Assigned Staff</th>
                                                            <th>Status</th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th>Lead Name</th>
                                                            <th>Phone</th>
                                                            <th>Course</th>
                                                            <th>Source</th>
                                                            <th>Assigned To</th>
                                                            <th>Status</th>
                                                            <th>Created Date</th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const filteredList = modalData.filter(item => {
                                                        const searchStr = searchTerm.toLowerCase();
                                                        return (
                                                            (item.full_name && item.full_name.toLowerCase().includes(searchStr)) ||
                                                            (item.name && item.name.toLowerCase().includes(searchStr)) ||
                                                            (item.course && item.course.toLowerCase().includes(searchStr)) ||
                                                            (item.course_interested && item.course_interested.toLowerCase().includes(searchStr)) ||
                                                            (item.courses && item.courses.length > 0 && item.courses[0].course && item.courses[0].course.toLowerCase().includes(searchStr)) ||
                                                            (item.phone && item.phone.toLowerCase().includes(searchStr)) ||
                                                            (item.status && item.status.toLowerCase().includes(searchStr))
                                                        );
                                                    });

                                                    if (filteredList.length === 0) {
                                                        return <tr><td colSpan="7" className="text-center py-4 text-muted">No records found matching your search.</td></tr>;
                                                    }

                                                    return filteredList.map((item, idx) => (
                                                        <tr key={idx}>
                                                            {modalConfig.type === 'registered' ? (
                                                                <>
                                                                    <td className="fw-medium">{item.full_name}</td>
                                                                    <td>{item.courses && item.courses.length > 0 ? item.courses[0].course : 'N/A'}</td>
                                                                    <td><span className="badge bg-secondary">{item.batch || 'N/A'}</span></td>
                                                                    <td>
                                                                        <span className={`badge ${item.fee_status === 'Fully Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                            {item.fee_status}
                                                                        </span>
                                                                    </td>
                                                                    <td>{item.admission_date || 'N/A'}</td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                                            onClick={() => navigate(`/student/${item.student_id}`)}
                                                                        >
                                                                            View
                                                                        </button>
                                                                    </td>
                                                                </>
                                                            ) : modalConfig.type === 'walkins' ? (
                                                                <>
                                                                    <td className="fw-medium">{item.full_name || item.name}</td>
                                                                    <td>{item.created_at?.slice(0, 10)}</td>
                                                                    <td>{item.course_interested || item.course}</td>
                                                                    <td>{item.assigned_to}</td>
                                                                    <td><span className={`badge ${item.status === 'Walk-in' ? 'bg-success' : 'bg-info'}`}>{item.status}</span></td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="fw-medium">{item.full_name || item.name}</td>
                                                                    <td>{item.phone}</td>
                                                                    <td>{item.course_interested || item.course}</td>
                                                                    <td>{item.source}</td>
                                                                    <td>{item.assigned_to}</td>
                                                                    <td><span className="badge bg-primary">{item.status}</span></td>
                                                                    <td>{item.created_at?.slice(0, 10)}</td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
