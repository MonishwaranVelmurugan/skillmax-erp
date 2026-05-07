import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BASE_URL = 'http://localhost:8000';

const Backup = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await api.get('backup/list/');
            setBackups(res.data);
        } catch (error) {
            console.error("Failed to load backups", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setActionLoading(true);
        try {
            const res = await api.post('backup/create/');
            alert(res.data.message || "Backup created successfully");
            fetchBackups();
        } catch (error) {
            console.error("Backup creation failed", error);
            alert("Failed to create backup.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRestore = async (filename) => {
        if (!window.confirm(`WARNING\nRestoring backup will overwrite current database.\nContinue?`)) {
            return;
        }

        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", filename);

            const token = localStorage.getItem('token');
            const res = await fetch("http://localhost:8000/api/backup/restore/", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                alert("Database Restored Successfully");
                window.location.reload();
            } else {
                alert(data.message || "Restore Failed");
            }
        } catch (error) {
            console.error("Restore failed", error);
            alert("Failed to restore database.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete ${filename}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            await api.delete(`backup/delete/${filename}/`);
            fetchBackups();
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete backup.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownload = async (filename) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/backup/download/${filename}/`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                alert("Failed to download backup");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Backup download failed:', err);
            alert("Error downloading backup");
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fade-in container-fluid pt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0 text-primary">
                    <i className="bi bi-hdd-network me-2"></i>System Backup
                </h4>
                <button
                    className="btn btn-primary shadow-sm rounded-pill px-4"
                    onClick={handleCreateBackup}
                    disabled={actionLoading}
                >
                    {actionLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                    ) : (
                        <><i className="bi bi-cloud-arrow-up-fill me-2"></i>Create New Backup</>
                    )}
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Loading backups...</p>
                        </div>
                    ) : backups.length === 0 ? (
                        <div className="text-center p-5">
                            <i className="bi bi-folder-x display-4 text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">No backups found</h5>
                            <p className="small">Click "Create New Backup" to secure your database.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-muted">
                                    <tr>
                                        <th className="ps-4 fw-medium border-0 py-3">File Name</th>
                                        <th className="fw-medium border-0 py-3">Created On</th>
                                        <th className="fw-medium border-0 py-3">File Size</th>
                                        <th className="text-end pe-4 fw-medium border-0 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backups.map((b, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 fw-bold text-dark">
                                                <i className="bi bi-file-earmark-zip text-primary me-2 fs-5 align-middle"></i>
                                                {b.filename}
                                            </td>
                                            <td className="text-muted small">{formatDate(b.created_at)}</td>
                                            <td><span className="badge bg-light text-dark shadow-sm">{formatSize(b.size)}</span></td>
                                            <td className="text-end pe-4">
                                                <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                                                    <button
                                                        className="btn btn-sm btn-light border-end hover-bg-primary"
                                                        onClick={() => handleDownload(b.filename)}
                                                        title="Download SQL"
                                                    >
                                                        <i className="bi bi-download text-primary"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-light border-end hover-bg-warning"
                                                        onClick={() => handleRestore(b.filename)}
                                                        disabled={actionLoading}
                                                        title="Restore Database"
                                                    >
                                                        <i className="bi bi-arrow-counterclockwise text-warning"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-light hover-bg-danger"
                                                        onClick={() => handleDelete(b.filename)}
                                                        disabled={actionLoading}
                                                        title="Delete File"
                                                    >
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Backup;
