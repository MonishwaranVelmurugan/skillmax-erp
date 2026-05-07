import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import storageService from '../../services/storageService';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Auth Guard
    React.useEffect(() => {
        if (!storageService.isAuthenticated()) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Determine Title based on path
    const getPageTitle = (pathname) => {
        if (pathname.startsWith('/company-overview')) return 'Company Overview';
        if (pathname.startsWith('/student/')) return 'Student Overview';

        switch (pathname) {
            case '/dashboard': return 'Overview';
            case '/leads/enroll': return 'Lead Enrollment';
            case '/leads/followup': return 'Lead Follow-up';
            case '/admission': return 'Admission';
            case '/students': return 'Student Details';
            case '/certificate': return 'Certificate Application';
            case '/tracker': return 'Overall Tracker';
            case '/reports': return 'Reports & Analytics';

            case '/activity': return 'Activity Logs';
            case '/backup': return 'System Backup';
            case '/company-management': return 'Company Management';
            case '/profile': return 'My Profile';
            default: return 'Dashboard';
        }
    };

    const title = getPageTitle(location.pathname);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="app-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header title={title} toggleSidebar={toggleSidebar} />
                <div className="content-body" style={{ flex: 1 }}>
                    <Outlet />
                </div>
                <footer className="py-3 text-center bg-white border-top mt-auto text-muted small">
                    © 2026 Erpion ERP
                </footer>
            </main>
        </div>
    );
};

export default MainLayout;
