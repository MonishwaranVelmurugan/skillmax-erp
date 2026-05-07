import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import reportService from '../services/reportService';

const Tracker = () => {
    const location = useLocation();
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [filterMonth, setFilterMonth] = useState('');
    const [filterWeek, setFilterWeek] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [stats, setStats] = useState({
        kpis: {
            total_leads: 0,
            relevant_leads: 0,
            walk_ins: 0,
            amount_collected_formatted: '₹ 0'
        },
        staff_performance: []
    });

    // State reset on location change
    useEffect(() => {
        window.scrollTo(0, 0);
        setFilterYear(new Date().getFullYear().toString());
        setFilterMonth('');
        setFilterWeek('');
    }, [location]);

    useEffect(() => {
        fetchStats();
    }, [filterYear, filterMonth, filterWeek]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const data = await reportService.getTrackerStats(filterYear, filterMonth, filterWeek);
            setStats(data);
        } catch (error) {
            console.error('Failed to load tracker stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in">
            {/* Filters Row */}
            <div className="card card-custom p-3 mb-4">
                <div className="row g-3 align-items-center">
                    <div className="col-md-auto">
                        <span className="fw-bold text-muted"><i className="bi bi-funnel me-2"></i>Filter By:</span>
                    </div>
                    <div className="col-md-auto">
                        <select className="form-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                            <option value="2027">2027</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                    <div className="col-md-auto">
                        <select className="form-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                            <option value="">All Months</option>
                            <option value="January">January</option>
                            <option value="February">February</option>
                            <option value="March">March</option>
                            <option value="April">April</option>
                            <option value="May">May</option>
                            <option value="June">June</option>
                            <option value="July">July</option>
                            <option value="August">August</option>
                            <option value="September">September</option>
                            <option value="October">October</option>
                            <option value="November">November</option>
                            <option value="December">December</option>
                        </select>
                    </div>
                    <div className="col-md-auto">
                        <select className="form-select" value={filterWeek} onChange={e => setFilterWeek(e.target.value)}>
                            <option value="">All Weeks</option>
                            <option value="Week 1">Week 1</option>
                            <option value="Week 2">Week 2</option>
                            <option value="Week 3">Week 3</option>
                            <option value="Week 4">Week 4</option>
                        </select>
                    </div>
                    <div className="col-md-auto ms-auto">
                        <button className="btn btn-primary" onClick={fetchStats} disabled={isLoading}>
                            {isLoading ? (
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            ) : (
                                <i className="bi bi-arrow-clockwise me-1"></i>
                            )}
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="row g-4 mb-5">
                <div className="col-xl-3 col-sm-6">
                    <div className="card card-custom stat-card border-start border-4 border-primary">
                        <div className="text-muted small fw-bold text-uppercase mb-1">Total Leads</div>
                        <div className="d-flex align-items-center justify-content-between">
                            <h2 className="fw-bold mb-0 text-dark">{stats.kpis.total_leads}</h2>
                            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                                <i className="bi bi-people-fill"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-sm-6">
                    <div className="card card-custom stat-card border-start border-4 border-info">
                        <div className="text-muted small fw-bold text-uppercase mb-1">Relevant Leads</div>
                        <div className="d-flex align-items-center justify-content-between">
                            <h2 className="fw-bold mb-0 text-dark">{stats.kpis.relevant_leads}</h2>
                            <div className="stat-icon bg-info bg-opacity-10 text-info">
                                <i className="bi bi-check-all"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-sm-6">
                    <div className="card card-custom stat-card border-start border-4 border-success">
                        <div className="text-muted small fw-bold text-uppercase mb-1">Total Walk-ins</div>
                        <div className="d-flex align-items-center justify-content-between">
                            <h2 className="fw-bold mb-0 text-dark">{stats.kpis.walk_ins}</h2>
                            <div className="stat-icon bg-success bg-opacity-10 text-success">
                                <i className="bi bi-person-walking"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-sm-6">
                    <div className="card card-custom stat-card border-start border-4 border-warning">
                        <div className="text-muted small fw-bold text-uppercase mb-1">Amount Collected</div>
                        <div className="d-flex align-items-center justify-content-between">
                            <h2 className="fw-bold mb-0 text-dark">{stats.kpis.amount_collected_formatted}</h2>
                            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                                <i className="bi bi-currency-rupee"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Performance Table */}
            <div className="card card-custom p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Staff Performance Tracker</h5>
                    <button className="btn btn-sm btn-outline-secondary"><i className="bi bi-download me-1"></i> Export Report</button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-3 ps-3 rounded-start">Staff Name</th>
                                <th className="py-3">Role</th>
                                <th className="py-3 text-center">Leads Assigned</th>
                                <th className="py-3 text-center">Walk-ins Generated</th>
                                <th className="py-3 text-center">Admissions Closed</th>
                                <th className="py-3 pe-3 text-end rounded-end">Revenue Generated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.staff_performance.length > 0 ? (
                                stats.staff_performance.map((staff, index) => (
                                    <tr key={index}>
                                        <td className="ps-3 fw-medium">{staff.name}</td>
                                        <td><span className="badge bg-primary-subtle text-primary">{staff.role}</span></td>
                                        <td className="text-center">{staff.leads_assigned}</td>
                                        <td className="text-center">{staff.walk_ins}</td>
                                        <td className="text-center fw-bold text-success">{staff.admissions}</td>
                                        <td className="pe-3 text-end fw-bold">₹ {staff.revenue.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">No staff performance data available for this period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tracker;


