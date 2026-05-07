import React from 'react';
import './Certificate.css';

const CertificatePreview = ({ student }) => {
    if (!student) return null;

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="certificate-preview-container">
            <div className="certificate-card">
                <div className="certificate-inner-border"></div>

                {/* Decorative Ornaments */}
                <div className="certificate-ornament ornament-top-left"></div>
                <div className="certificate-ornament ornament-top-right"></div>
                <div className="certificate-ornament ornament-bottom-left"></div>
                <div className="certificate-ornament ornament-bottom-right"></div>

                <div className="certificate-header">Certificate of Completion</div>

                <h1 className="certificate-title">PROUDLY PRESENTED TO</h1>

                <div className="certificate-subtitle">This is to certify that</div>

                <div className="certificate-student-name">{student.name || student.full_name}</div>

                <div className="certificate-subtitle">has successfully completed the course in</div>

                <div className="certificate-course">{student.course || (student.courses?.[0]?.name || 'Professional Certification')}</div>

                <div className="certificate-subtitle">at Erpion ERP, demonstrating excellence and commitment.</div>

                <div className="certificate-footer">
                    <div className="footer-item">
                        <div className="date-value fw-bold">{today}</div>
                        <div className="date-label">Date of Issue</div>
                    </div>
                    <div className="footer-item">
                        <div className="signature-img" style={{ height: '30px' }}></div>
                        <div className="signature-label">Director, Erpion ERP</div>
                    </div>
                </div>

                <div className="certificate-id">ID: ERPION-{student.id || student.student_id}-{Math.floor(Math.random() * 10000)}</div>
            </div>
        </div>
    );
};

export default CertificatePreview;
