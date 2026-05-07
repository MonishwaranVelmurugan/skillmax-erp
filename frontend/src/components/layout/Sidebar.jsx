import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { getCurrentUser, isAdmin, isAdminOrAM, isSuperAdmin } from '../../utils/auth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const role = localStorage.getItem('role') || '';
    const isSaaSUser = role === 'SUPERADMIN';

    return (
        <>
            <aside className={`sidebar ${isOpen ? 'show' : ''}`} id="sidebar">
                <div className="sidebar-header">
                    <Link to={isSaaSUser ? "/saas-dashboard" : "/dashboard"} className="brand-logo">
                        <div className="brand-icon"><i className="bi bi-grid-1x2-fill"></i></div>
                        <span className="ms-2 fs-4">Erpion</span>
                    </Link>
                    <button className="btn-close d-lg-none ms-auto" onClick={toggleSidebar} aria-label="Close"></button>
                </div>

                <ul className="nav flex-column sidebar-menu">
                    {/* SaaS Management Menu - ONLY for SUPERADMIN */}
                    {isSaaSUser && (
                        <>
                            <li className="nav-header text-uppercase text-muted fw-bold fs-7 ps-3 mt-3 mb-2" style={{ fontSize: '0.75rem' }}>SaaS MANAGEMENT</li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to={`/saas-dashboard`}>
                                    <i className="bi bi-speedometer2"></i> SaaS Dashboard
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to={`/company-management`}>
                                    <i className="bi bi-building"></i> Company Management
                                </NavLink>
                            </li>

                        </>
                    )}

                    {/* ERP Modules - ONLY for NON-SUPERADMIN */}
                    {!isSaaSUser && (
                        <>
                            <li className="nav-item">
                                <NavLink className="nav-link" to={`/dashboard?refresh=${Date.now()}`}>
                                    <i className="bi bi-speedometer2"></i> Dashboard
                                </NavLink>
                            </li>

                            {['ADMIN', 'AM', 'CRO', 'CRE', 'BDE'].includes(role) && (
                                <>
                                    <li className="nav-header text-uppercase text-muted fw-bold fs-7 ps-3 mt-3 mb-2" style={{ fontSize: '0.75rem' }}>Leads & Sales</li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/leads/enroll?refresh=${Date.now()}`}>
                                            <i className="bi bi-person-plus"></i> Lead Enrollment
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/leads/followup?refresh=${Date.now()}`}>
                                            <i className="bi bi-telephone-inbound"></i> Lead Follow-up
                                        </NavLink>
                                    </li>
                                </>
                            )}

                            {['ADMIN', 'AM', 'CRO', 'CRE'].includes(role) && (
                                <>
                                    <li className="nav-header text-uppercase text-muted fw-bold fs-7 ps-3 mt-3 mb-2" style={{ fontSize: '0.75rem' }}>Academics</li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/admission?refresh=${Date.now()}`}>
                                            <i className="bi bi-mortarboard"></i> Admission
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/students?refresh=${Date.now()}`}>
                                            <i className="bi bi-people"></i> Student Details
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/certificate?refresh=${Date.now()}`}>
                                            <i className="bi bi-award"></i> Certificate Apply
                                        </NavLink>
                                    </li>
                                </>
                            )}

                            {['ADMIN', 'AM'].includes(role) && (
                                <>
                                    <li className="nav-header text-uppercase text-muted fw-bold fs-7 ps-3 mt-3 mb-2" style={{ fontSize: '0.75rem' }}>Admin</li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/tracker?refresh=${Date.now()}`}>
                                            <i className="bi bi-activity"></i> Overall Tracker
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/reports?refresh=${Date.now()}`}>
                                            <i className="bi bi-bar-chart"></i> Reports Tracker
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/activity?refresh=${Date.now()}`}>
                                            <i className="bi bi-journal-text"></i> Activity Logs
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={`/backup?refresh=${Date.now()}`}>
                                            <i className="bi bi-hdd-network"></i> System Backup
                                        </NavLink>
                                    </li>
                                    {role === 'ADMIN' && (
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to={`/manage-users?refresh=${Date.now()}`}>
                                                <i className="bi bi-people-fill"></i> Manage Users
                                            </NavLink>
                                        </li>
                                    )}
                                    {role === 'ADMIN' && (
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to={`/settings/admission-fields?refresh=${Date.now()}`}>
                                                <i className="bi bi-list-check"></i> Admission Form Fields
                                            </NavLink>
                                        </li>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </ul>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isOpen && (
                <div
                    className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
                    style={{ zIndex: 999 }}
                    onClick={toggleSidebar}
                ></div>
            )}
        </>
    );
};

export default Sidebar;

