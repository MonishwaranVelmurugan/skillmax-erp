import React, { useState, useEffect } from 'react';
import studentService from '../services/studentService';

const StudentHistoryModal = ({ student, onClose, onUpdate }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [undoing, setUndoing] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    useEffect(() => {
        if (student) {
            loadHistory(true);
        }
    }, [student]);

    const loadHistory = async (reset = false) => {
        setLoading(true);
        try {
            const newOffset = reset ? 0 : offset;
            const data = await studentService.getHistory(student.id, LIMIT, newOffset);

            if (reset) {
                setHistory(data);
                setOffset(LIMIT);
            } else {
                setHistory(prev => [...prev, ...data]);
                setOffset(prev => prev + LIMIT);
            }

            if (data.length < LIMIT) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            alert('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleUndo = async (logId) => {
        if (!window.confirm('Are you sure you want to undo this change?')) return;

        setUndoing(logId);
        try {
            await studentService.undoChange(student.id, logId);
            alert('Change reverted successfully');
            onUpdate(); // Refresh parent student data
            loadHistory(true); // Refresh history list
        } catch (error) {
            console.error('Failed to undo:', error);
            alert(error.response?.data?.error || 'Failed to revert change');
        } finally {
            setUndoing(null);
        }
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title d-flex align-items-center">
                            <i className="bi bi-clock-history me-2"></i>
                            Student Change History: {student.name}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light sticky-top">
                                    <tr>
                                        <th className="px-3 py-2">Date</th>
                                        <th className="py-2">Field</th>
                                        <th className="py-2">Old Value</th>
                                        <th className="py-2">New Value</th>
                                        <th className="py-2">User</th>
                                        <th className="py-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-3 small text-muted">{log.date}</td>
                                            <td><span className="badge bg-secondary-subtle text-secondary">{log.field}</span></td>
                                            <td className="small text-truncate" style={{ maxWidth: '150px' }}>{log.old}</td>
                                            <td className="small text-truncate" style={{ maxWidth: '150px' }}>{log.new}</td>
                                            <td className="small">{log.user}</td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-xs btn-outline-danger py-0 px-2"
                                                    style={{ fontSize: '11px' }}
                                                    onClick={() => handleUndo(log.id)}
                                                    disabled={undoing === log.id}
                                                >
                                                    {undoing === log.id ? '...' : 'Undo'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted">No history found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {hasMore && (
                            <div className="text-center p-3 border-top">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => loadHistory(false)}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer bg-light p-2">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHistoryModal;
