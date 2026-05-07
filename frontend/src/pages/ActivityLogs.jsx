import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [userFilter, setUserFilter] = useState('All Users');
    const [actionFilter, setActionFilter] = useState('All Actions');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchLogs = () => {
        setIsLoading(true);
        setError(false);
        axios.get("http://localhost:8000/api/activity-logs/", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => {
                setLogs(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch activity logs:', err);
                setError(true);
                setIsLoading(false);
            });
    };

    const handleReset = () => {
        setSearchTerm('');
        setDebouncedSearch('');
        setUserFilter('All Users');
        setActionFilter('All Actions');
        setFromDate('');
        setToDate('');
    };

    const filteredLogs = React.useMemo(() => {
        return logs.filter(log => {
            // Search filter (using debounced value)
            const searchMatch = !debouncedSearch ||
                log.user?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                log.action?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                log.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

            // User filter
            const userMatch = userFilter === 'All Users' || log.user === userFilter;

            // Action filter
            const actionMatch = actionFilter === 'All Actions' || log.action === actionFilter;

            // Date filter
            let dateMatch = true;
            if (fromDate || toDate) {
                const logDate = log.timestamp.split(' ')[0]; // YYYY-MM-DD
                if (fromDate && logDate < fromDate) dateMatch = false;
                if (toDate && logDate > toDate) dateMatch = false;
            }

            return searchMatch && userMatch && actionMatch && dateMatch;
        });
    }, [logs, debouncedSearch, userFilter, actionFilter, fromDate, toDate]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionBadgeClass = (action) => {
        if (action === 'LOGIN FAILED') return 'bg-danger text-white';
        if (action.includes('CREATED')) return 'bg-success';
        if (action.includes('DELETED')) return 'bg-danger';
        if (action.includes('UPDATED')) return 'bg-warning text-dark';
        if (action === 'LOGIN') return 'bg-info text-white';
        if (action === 'LOGOUT') return 'bg-secondary';
        return 'bg-primary';
    };

    return (
        <div className="fade-in">
            <div className="card card-custom p-0 overflow-hidden">
                <div className="card-header-clean p-4 border-bottom bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="fw-bold mb-1">Activity Logs</h4>
                        <p className="text-muted mb-0">Monitor all system actions and user movements.</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={fetchLogs} disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : (
                            <i className="bi bi-arrow-clockwise me-2"></i>
                        )}
                        Refresh Logs
                    </button>
                </div>

                {/* Filter Toolbar Section */}
                <div className="p-4 bg-light border-bottom">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Search</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search user / rollno / action..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-auto">
                            <label className="form-label small fw-bold text-muted">User</label>
                            <select
                                className="form-select form-select-sm"
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                            >
                                <option value="All Users">All Users</option>
                                <option value="SUPERADMIN">SUPERADMIN</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="BDE">BDE</option>
                                <option value="CRE">CRE</option>
                                <option value="CRO">CRO</option>
                            </select>
                        </div>

                        <div className="col-md-auto">
                            <label className="form-label small fw-bold text-muted">Action</label>
                            <select
                                className="form-select form-select-sm"
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                            >
                                <option value="All Actions">All Actions</option>
                                <option value="LOGIN">LOGIN</option>
                                <option value="LOGIN FAILED">LOGIN FAILED</option>
                                <option value="LOGOUT">LOGOUT</option>
                                <option value="STUDENT UPDATED">STUDENT UPDATED</option>
                                <option value="PAYMENT UPDATED">PAYMENT UPDATED</option>
                                <option value="STUDENT DELETED">STUDENT DELETED</option>
                                <option value="INVOICE CREATED">INVOICE CREATED</option>
                                <option value="RECEIPT CREATED">RECEIPT CREATED</option>
                            </select>
                        </div>

                        <div className="col-md-auto">
                            <label className="form-label small fw-bold text-muted">From Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className="col-md-auto">
                            <label className="form-label small fw-bold text-muted">To Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        <div className="col-md-auto">
                            <button className="btn btn-sm btn-outline-secondary px-3" onClick={handleReset}>
                                <i className="bi bi-x-circle me-1"></i> Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    {error && (
                        <div className="alert alert-danger m-4" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i> Failed to load activity logs
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3">Timestamp</th>
                                    <th className="py-3">User</th>
                                    <th className="py-3">Action</th>
                                    <th className="py-3">Description</th>
                                    <th className="pe-4 py-3 text-end">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 text-muted">Fetching latest activities...</p>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map((log, index) => (
                                        <tr key={index}>
                                            <td className="ps-4">
                                                <div className="d-flex flex-column">
                                                    <span className="fw-medium text-dark">{log.timestamp.split(' ')[0]}</span>
                                                    <span className="text-muted small">{log.timestamp.split(' ')[1]}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm bg-light rounded-circle text-primary me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                        <i className="bi bi-person"></i>
                                                    </div>
                                                    <span className="fw-bold">{log.user}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getActionBadgeClass(log.action)} px-2 py-1`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <p className="mb-0 text-muted small" style={{ maxWidth: '400px' }}>
                                                    {log.description}
                                                </p>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <span className="text-success small">
                                                    <i className="bi bi-check-circle-fill me-1"></i> {log.status || 'Success'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <i className="bi bi-journal-x fs-1 d-block mb-3"></i>
                                            {logs.length === 0 ? "No activities recorded yet." : "No activities matching your filters."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredLogs.length > 0 && (
                    <div className="card-footer bg-white p-3 border-top text-center text-muted small">
                        Showing {filteredLogs.length} matching activities
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
