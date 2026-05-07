import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../utils/auth';

const LeadFollowup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('today');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    // State reset on location change
    useEffect(() => {
        window.scrollTo(0, 0);

        const params = new URLSearchParams(window.location.search);
        const urlLeadId = params.get("leadId");
        const stateLeadId = location.state && location.state.searchLeadId;
        const targetLeadId = urlLeadId || stateLeadId;

        if (targetLeadId) {
            console.log('[LeadFollowup] Targeting lead ID:', targetLeadId);

            // Fetch all leads then expand the specific one
            const targetLead = async () => {
                await fetchLeads('');
                setExpandedRows({ [targetLeadId]: true });

                setTimeout(() => {
                    const el = document.querySelector(`[data-lead-id="${targetLeadId}"]`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('bg-primary-subtle');
                        setTimeout(() => el.classList.remove('bg-primary-subtle'), 2000);
                    }
                }, 800);
            };
            targetLead();
        } else {
            setSearchQuery('');
            setActiveTab('today');
            setExpandedRows({});
            setShowModal(false);
            setSelectedLead(null);
            setLeads([]);
            fetchLeads('');
        }
    }, [location.pathname, location.search]);

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leadRemarks, setLeadRemarks] = useState({});
    const [walkInCounts, setWalkInCounts] = useState({});

    // Modal State
    const [nextDate, setNextDate] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const abortControllerRef = React.useRef(null);

    const fetchLeads = async (query = searchQuery, signal = null) => {
        setLoading(true);
        try {
            const url = query.trim() ? `leads/?search=${encodeURIComponent(query.trim())}` : 'leads/';
            const response = await api.get(url, { signal });

            // Only exclude Converted leads from the follow-up view.
            const visibleLeads = response.data.filter(
                lead => lead.status !== 'Converted'
            );

            // Transform backend data to frontend structure
            const transformedLeads = visibleLeads.map(lead => ({
                id: lead.id,
                name: lead.full_name,
                course: lead.course_interested,
                phone: lead.phone,
                status: lead.status,
                statusColor: getStatusColor(lead.status),
                timings: lead.next_follow_up_date || 'No Date',
                next_follow_up_date: lead.next_follow_up_date,
                category: determineCategory(lead),
                reason: lead.status === 'Dead' ? 'Marked as Dead' : '',
                created_at: lead.created_at,
                remarks: lead.remarks || ''
            }));

            setLeads(transformedLeads);
            setError(null);
        } catch (err) {
            if (err.name === 'AbortError' || err.name === 'CanceledError') return;
            console.error('Failed to fetch leads:', err);
            setError('Failed to load leads. Please try again.');
        } finally {
            if (signal && signal.aborted) return;
            setLoading(false);
        }
    };

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();
            fetchLeads(searchQuery, abortControllerRef.current.signal);
        }, 400);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();
            fetchLeads(searchQuery, abortControllerRef.current.signal);
        }
    };

    const fetchLeadRemarks = async (leadId) => {
        try {
            const response = await api.get(`lead-remarks/?lead_id=${leadId}`);
            return response.data;
        } catch (err) {
            console.error('Failed to fetch remarks:', err);
            return [];
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'text-primary';
            case 'Contacted': return 'text-info';
            case 'Qualified': return 'text-success';
            case 'Lost': return 'text-secondary';
            case 'Dead': return 'text-danger';
            case 'Converted': return 'text-success';
            case 'Follow-up': return 'text-warning';
            default: return 'text-muted';
        }
    };

    const determineCategory = (lead) => {
        if (lead.status === 'Dead') return 'dead';

        if (!lead.next_follow_up_date) return 'active';

        const today = new Date().toISOString().split('T')[0];
        if (lead.next_follow_up_date === today) return 'today';
        if (lead.next_follow_up_date > today) return 'active';

        return 'active';
    };

    const toggleRow = async (id) => {
        const isExpanding = !expandedRows[id];

        setExpandedRows(prev => ({
            ...prev,
            [id]: isExpanding
        }));

        // Fetch remarks and walk-in count when expanding
        if (isExpanding && !leadRemarks[id]) {
            const remarks = await fetchLeadRemarks(id);
            setLeadRemarks(prev => ({
                ...prev,
                [id]: remarks
            }));
        }
        if (isExpanding) {
            try {
                const response = await api.get(`walk-ins/?lead_id=${id}`);
                setWalkInCounts(prev => ({
                    ...prev,
                    [id]: response.data.length
                }));
            } catch (err) {
                console.error('Failed to fetch walk-in count:', err);
            }
        }
    };

    const openModal = (lead) => {
        setSelectedLead(lead);
        setNextDate(lead.next_follow_up_date || '');
        setNotes('');
        setShowModal(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedLead) return;
        setIsSubmitting(true);
        setError(null);

        try {
            // Update lead with new follow-up date
            await api.patch(`leads/${selectedLead.id}/`, {
                next_follow_up_date: nextDate,
                status: 'Follow-up',
            });

            // Save remark if notes provided
            if (notes.trim()) {
                const user = JSON.parse(localStorage.getItem('a3_campus_user') || '{}');
                await api.post('lead-remarks/', {
                    lead: selectedLead.id,
                    remark_text: notes,
                    created_by: user.username || 'Unknown'
                });

                // Fetch and update remarks for this lead immediately to reflect changes
                const updatedRemarks = await fetchLeadRemarks(selectedLead.id);
                setLeadRemarks(prev => ({
                    ...prev,
                    [selectedLead.id]: updatedRemarks
                }));
            }

            // Refresh list
            await fetchLeads();
            setShowModal(false);
            alert('Follow-up updated successfully!');
        } catch (err) {
            console.error('Failed to update lead:', err);
            alert('Failed to update follow-up. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportLeads = async () => {
        try {
            setLoading(true);
            const response = await api.get('leads/export/', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Try to get filename from content-disposition header
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'leads_export.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            } else {
                // Fallback dynamic name
                const user = JSON.parse(localStorage.getItem('a3_campus_user') || '{}');
                const company = (user.company_name || 'erpion').toLowerCase().replace(/\s+/g, '_');
                const date = new Date().toISOString().split('T')[0];
                filename = `${company}_leads_${date}.xlsx`;
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export leads. Please check your permissions.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsDead = async (lead) => {
        if (!window.confirm(`Are you sure you want to mark ${lead.name} as Dead?`)) return;

        try {
            await api.patch(`leads/${lead.id}/`, {
                status: 'Dead'
            });
            await fetchLeads(); // Refresh list
        } catch (err) {
            console.error('Failed to mark as dead:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleWalkIn = async (lead) => {
        try {
            const user = JSON.parse(localStorage.getItem('a3_campus_user') || '{}');
            await api.post('walk-ins/', {
                lead: lead.id,
                recorded_by: user.username || 'Unknown'
            });
            // Refresh walk-in count for this lead
            const response = await api.get(`walk-ins/?lead_id=${lead.id}`);
            setWalkInCounts(prev => ({
                ...prev,
                [lead.id]: response.data.length
            }));
            alert(`Walk-in recorded for ${lead.name} successfully!`);
        } catch (err) {
            console.error('Failed to record walk-in:', err);
            alert('Failed to record walk-in. Please try again.');
        }
    };

    const handleAdmission = (lead) => {
        // Navigate to Admission page with state
        navigate('/admission', {
            state: {
                walkInLeadData: {
                    leadId: lead.id,
                    name: lead.full_name || lead.name,
                    phone: lead.phone,
                    email: lead.email,
                    course: lead.course_interested || lead.course,
                    education: lead.education,
                    leadSource: 'Walk-in',
                    assignedTo: lead.assigned_to || 'ADMIN'
                }
            }
        });
    };

    // Filter Logic - now simpler as server already filtered by query, 
    // but we still need active filter based on tabs.
    const filteredLeads = leads;

    // Group by category after filtering
    const todayLeads = filteredLeads.filter(l => l.category === 'today');
    const activeLeads = filteredLeads.filter(l => l.category === 'active');
    const deadLeads = filteredLeads.filter(l => l.category === 'dead');

    // Auto-switch tab if only one tab has results
    React.useEffect(() => {
        if (searchQuery) {
            if (todayLeads.length > 0 && activeLeads.length === 0 && deadLeads.length === 0) setActiveTab('today');
            else if (todayLeads.length === 0 && activeLeads.length > 0 && deadLeads.length === 0) setActiveTab('active');
            else if (todayLeads.length === 0 && activeLeads.length === 0 && deadLeads.length > 0) setActiveTab('dead');
        }
    }, [searchQuery, todayLeads.length, activeLeads.length, deadLeads.length]);

    return (
        <div className="fade-in">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                {/* Tabs Navigation */}
                <ul className="nav nav-pills mb-3 mb-md-0">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'today' ? 'active' : ''}`}
                            onClick={() => setActiveTab('today')}
                            disabled={searchQuery && todayLeads.length === 0}
                        >
                            Today Follow-up
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                            disabled={searchQuery && activeLeads.length === 0}
                        >
                            In Follow-up
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'dead' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dead')}
                            disabled={searchQuery && deadLeads.length === 0}
                        >
                            Dead Follow-up
                        </button>
                    </li>
                </ul>

                {/* Search & Export */}
                <div className="d-flex align-items-center gap-2">
                    <div className="input-group" style={{ width: '300px' }}>
                        <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search Name, Course, Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    {isAdmin() && (
                        <button
                            className="btn d-flex align-items-center gap-2"
                            style={{
                                backgroundColor: '#7C3AED',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontWeight: '500',
                                border: 'none'
                            }}
                            onClick={handleExportLeads}
                            disabled={loading}
                        >
                            <i className="bi bi-download"></i>
                            Export Leads
                        </button>
                    )}
                </div>
            </div>

            <div className="card shadow-sm border-0">
                {filteredLeads.length === 0 && (
                    <div className="alert alert-warning m-3" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>No records found matching your search.
                    </div>
                )}

                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Lead Name</th>
                                    <th>Course</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>{activeTab === 'dead' ? 'Reason/Closed' : (activeTab === 'active' ? 'Next Follow-up' : 'Timings')}</th>
                                    <th className="text-end pe-4">Action</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'today' ? todayLeads : activeTab === 'active' ? activeLeads : deadLeads).map(lead => (
                                    <React.Fragment key={lead.id}>
                                        <tr data-lead-id={lead.id} style={{ transition: 'background-color 0.5s ease' }}>
                                            <td className="ps-4 fw-bold">{lead.name}</td>
                                            <td className="text-secondary">{lead.course}</td>
                                            <td style={{ fontFamily: 'monospace', color: '#475569' }}>{lead.phone}</td>
                                            <td><span className={`badge bg-light ${lead.statusColor}`}>{lead.status}</span></td>
                                            <td>
                                                {activeTab === 'dead' ? (
                                                    <small className="text-muted">{lead.reason}</small>
                                                ) : (
                                                    <span className={activeTab === 'today' ? 'text-primary fw-bold' : ''}>{lead.timings}</span>
                                                )}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-outline-info dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        data-bs-boundary="viewport"
                                                    >
                                                        Action
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                                                        <li><button className="dropdown-item" onClick={() => openModal(lead)}>
                                                            <i className="bi bi-calendar-plus me-2"></i>{lead.category === 'dead' ? 'Re-open Followup' : 'Next Followup'}
                                                        </button></li>
                                                        <li><button className="dropdown-item" onClick={() => handleWalkIn(lead)}>
                                                            <i className="bi bi-person-walking me-2"></i>Walk-in
                                                        </button></li>
                                                        <li><button className="dropdown-item text-success" onClick={() => handleAdmission(lead)}>
                                                            <i className="bi bi-mortarboard me-2"></i>Admission
                                                        </button></li>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li><button className="dropdown-item text-danger" onClick={() => handleMarkAsDead(lead)}>
                                                            <i className="bi bi-x-circle me-2"></i>Mark as Dead
                                                        </button></li>
                                                    </ul>
                                                </div>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-light border-0" onClick={() => toggleRow(lead.id)}>
                                                    <i className={`bi bi-chevron-${expandedRows[lead.id] ? 'up' : 'down'}`}></i>
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRows[lead.id] && (
                                            <tr className="bg-light">
                                                <td colSpan="7" className="p-3">
                                                    <div className="small">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <strong className="text-dark">Remarks History:</strong>
                                                            <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                                                                <i className="bi bi-person-walking me-1"></i>
                                                                Walk-ins: {walkInCounts[lead.id] ?? '...'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            {/* Show dynamic remarks history */}
                                                            {leadRemarks[lead.id] && leadRemarks[lead.id].map((remark, index) => (
                                                                <div key={remark.id} className="mb-2 ps-3 border-start border-primary border-2">
                                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                        {new Date(remark.created_at).toLocaleString('en-IN', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                        {remark.created_by && ` - ${remark.created_by}`}
                                                                    </div>
                                                                    <div className="text-dark">{remark.remark_text}</div>
                                                                </div>
                                                            ))}

                                                            {/* Always show Initial Remark at the bottom (oldest) if it exists */}
                                                            {lead.remarks ? (
                                                                <div className="mb-2 ps-3 border-start border-secondary border-2">
                                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                        {lead.created_at ? new Date(lead.created_at).toLocaleString('en-IN', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        }) + ' - Initial Remark' : 'Initial Remark'}
                                                                    </div>
                                                                    <div className="text-dark">{lead.remarks}</div>
                                                                </div>
                                                            ) : (
                                                                (!leadRemarks[lead.id] || leadRemarks[lead.id].length === 0) && (
                                                                    <div className="text-muted ps-3">No remarks recorded yet</div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for Next Followup */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Schedule Next Follow-up</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Schedule a new follow-up date for <strong>{selectedLead?.name}</strong>.</p>
                                <div className="mb-3">
                                    <label className="form-label">Next Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={nextDate}
                                        onChange={(e) => setNextDate(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add conversation notes..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveChanges} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadFollowup;
