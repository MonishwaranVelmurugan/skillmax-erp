/**
 * CertificateTemplate.jsx
 * ─────────────────────────────────────────────────────────────
 * Premium Erpion ERP certificate template.
 * A4 Portrait — 210mm × 297mm, Blue & Gold theme, printable / PDF-exportable.
 *
 * Props:
 *   student  – student object from the existing ERP database
 *   onClose  – callback to close / go back
 *
 * NOTE: This component is purely a design/template layer.
 *       It does NOT modify any backend models, serializers,
 *       views, URLs, or any other existing page.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './CertificateTemplate.css';

/* ── helpers ─────────────────────────────────────────────────── */

/** Build a deterministic certificate ID from the student record */
const buildCertId = (student) => {
    const sid = student?.student_id || student?.id || 'CERT';
    const year = new Date().getFullYear();
    // Simple hash from student_id chars to create a suffix
    const suffix = String(
        (sid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 9000) + 1000
    );
    return `ERPION-${year}-${sid}-${suffix}`;
};

/** Format today's date as "19 February 2026" */
const formatDate = (d = new Date()) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

/** Derive course info from the student JSON */
const getCourseInfo = (student) => {
    const courses = student?.courses || [];
    const first = Array.isArray(courses) && courses.length > 0 ? courses[0] : null;
    return {
        name: first?.name || student?.course || 'Professional Certification',
        duration: first?.duration || '3 Months',
        modules: first?.modules || first?.syllabus || 'Core Concepts, Practical Training, Industry Projects & Assessment',
        category: first?.category || '',
    };
};

/** QR verification URL — links to a verification route with the cert ID */
const buildVerifyUrl = (certId) =>
    `${window.location.origin}/verify/${encodeURIComponent(certId)}`;

/* ── Corner SVG ornament ─────────────────────────────────────── */
const CornerOrnament = () => (
    <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
        {/* L-bracket */}
        <path d="M4 4 L4 52" stroke="#c8922a" strokeWidth="2" fill="none" />
        <path d="M4 4 L52 4" stroke="#c8922a" strokeWidth="2" fill="none" />
        {/* inner L */}
        <path d="M10 10 L10 38" stroke="#e4b84a" strokeWidth="0.8" fill="none" />
        <path d="M10 10 L38 10" stroke="#e4b84a" strokeWidth="0.8" fill="none" />
        {/* diamond */}
        <rect x="1.5" y="1.5" width="5" height="5" rx="0.5"
            fill="#c8922a" transform="rotate(45 4 4)" />
    </svg>
);

/* ── Logo icon (mortar board) ────────────────────────────────── */
const LogoIcon = () => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,4 30,11 16,18 2,11" fill="#e4b84a" />
        <path d="M24,14 L24,22 C24,25.3 20.4,28 16,28 C11.6,28 8,25.3 8,22 L8,14 L16,18 Z"
            fill="#c8922a" />
        <rect x="28" y="11" width="2" height="9" rx="1" fill="#e4b84a" />
        <circle cx="29" cy="21.5" r="1.8" fill="#c8922a" />
    </svg>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const CertificateTemplate = ({ student, onClose }) => {
    const docRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    // Derived data — all from the existing student object
    const certId = buildCertId(student);
    const issueDate = formatDate();
    const rollNo = student?.student_id || student?.id || '—';
    const studentName = student?.full_name || student?.name || 'Student Name';
    const location = 'Erpion ERP';
    const course = getCourseInfo(student);
    const verifyUrl = buildVerifyUrl(certId);

    // Watermark rows (repeated lines)
    const wmLines = Array.from({ length: 12 }, () =>
        'Erpion ERP   ✦   '
    ).join('');

    /* ── PDF / Print export ─────────────────────────────────── */
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const handleExportPDF = useCallback(async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            // Dynamic imports to keep bundle size down
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(docRef.current, {
                scale: 3,           // 3× → ~288 dpi effective
                useCORS: true,
                backgroundColor: '#fefcf5',
                logging: false,
                width: 794,         // A4 portrait at 96 dpi
                height: 1123,
            });

            // A4 portrait — 210 × 297 mm
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.97);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            pdf.save(`Certificate_${studentName.replace(/\s+/g, '_')}_${certId}.pdf`);
        } catch (err) {
            console.error('[CertificateTemplate] PDF export failed:', err);
            // Fallback to print
            window.print();
        } finally {
            setIsExporting(false);
        }
    }, [student, certId, studentName, isExporting]);

    return (
        <div className="cert-wrapper">

            {/* ── Toolbar (hidden on print) ─────────────────── */}
            <div className="cert-toolbar">
                <button
                    className="btn-cert-action btn-cert-pdf"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                            />
                            Exporting…
                        </>
                    ) : (
                        <>
                            <i className="bi bi-file-pdf-fill" />
                            Download PDF
                        </>
                    )}
                </button>

                <button
                    className="btn-cert-action btn-cert-pdf"
                    onClick={handlePrint}
                    style={{ background: 'linear-gradient(135deg,#1a3a6b,#2c5fa8)' }}
                >
                    <i className="bi bi-printer-fill" />
                    Print Certificate
                </button>

                {onClose && (
                    <button className="btn-cert-action btn-cert-close" onClick={onClose}>
                        <i className="bi bi-arrow-left" />
                        Back
                    </button>
                )}
            </div>

            {/* ══════════════════════════════════════════════════
                THE CERTIFICATE DOCUMENT (A4 Portrait — 210×297mm)
                ══════════════════════════════════════════════════ */}
            <div className="cert-document" ref={docRef} id="certificate-document">

                {/* ── Borders ─────────────────────────────────── */}
                <div className="cert-border-outer" />
                <div className="cert-border-inner" />
                <div className="cert-border-hairline" />

                {/* ── Corner ornaments ─────────────────────────── */}
                <div className="cert-corner tl"><CornerOrnament /></div>
                <div className="cert-corner tr"><CornerOrnament /></div>
                <div className="cert-corner bl"><CornerOrnament /></div>
                <div className="cert-corner br"><CornerOrnament /></div>

                {/* ── Watermark ────────────────────────────────── */}
                <div className="cert-watermark" aria-hidden="true">
                    <div className="cert-watermark-text">
                        {wmLines}
                        <br />{wmLines}
                        <br />{wmLines}
                        <br />{wmLines}
                    </div>
                </div>

                {/* ── Main content ─────────────────────────────── */}
                <div className="cert-content">

                    {/* ┌───────────── TOP SECTION ─────────────────┐ */}
                    <div className="cert-top">
                        {/* Logo row */}
                        <div className="cert-logo-area">
                            <div className="cert-logo-icon">
                                <LogoIcon />
                            </div>
                            <div>
                                <div className="cert-company-name">Erpion</div>
                                <div className="cert-company-sub">ERP</div>
                            </div>
                        </div>

                        {/* Gold divider */}
                        <div className="cert-divider">
                            <div className="cert-divider-line" />
                            <div className="cert-divider-diamond" />
                            <div className="cert-divider-line" />
                        </div>

                        {/* CERTIFICATE heading */}
                        <h1 className="cert-heading">CERTIFICATE</h1>
                        <div className="cert-heading-sub">of Completion &nbsp;✦&nbsp; Erpion ERP</div>

                        {/* Divider */}
                        <div className="cert-divider" style={{ marginTop: '3px' }}>
                            <div className="cert-divider-line" />
                            <div className="cert-divider-diamond" />
                            <div className="cert-divider-line" />
                        </div>
                    </div>
                    {/* └──────────────────────────────────────────┘ */}

                    {/* ┌───────────── BODY SECTION ─────────────────┐ */}
                    <div className="cert-body">
                        <p className="cert-phrase">This is to certify that</p>

                        {/* Dynamic student name */}
                        <div className="cert-student-name">{studentName}</div>

                        <p className="cert-phrase">has successfully completed</p>

                        {/* Dynamic course duration */}
                        <div className="cert-course-duration">{course.duration}</div>

                        <p className="cert-phrase">course in</p>

                        {/* Dynamic course name */}
                        <div className="cert-course-name">{course.name}</div>

                        {/* Dynamic modules */}
                        <p className="cert-phrase" style={{ marginTop: '2px' }}>
                            Which covers&nbsp;
                            <em style={{ color: '#0d2748', fontStyle: 'normal', fontWeight: 600 }}>
                                {course.modules}
                            </em>
                        </p>

                        {/* Dynamic location */}
                        <div className="cert-location">At {location}</div>
                    </div>
                    {/* └──────────────────────────────────────────┘ */}

                    {/* ┌───────────── BOTTOM 3-COL SECTION ─────────┐ */}
                    <div className="cert-bottom">

                        {/* LEFT — Signature */}
                        <div className="cert-sig-col">
                            <div className="cert-sig-line" />
                            <div className="cert-sig-label">Director, Erpion ERP</div>
                        </div>

                        {/* CENTER — Seal */}
                        <div className="cert-seal-col">
                            <div className="cert-seal">
                                <div className="cert-seal-icon">🎓</div>
                                <div className="cert-seal-text">Official Seal</div>
                            </div>
                        </div>

                        {/* RIGHT — QR Code */}
                        <div className="cert-qr-col">
                            <div className="cert-qr-box">
                                <QRCodeSVG
                                    value={verifyUrl}
                                    size={64}
                                    bgColor="#ffffff"
                                    fgColor="#0d2748"
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>
                            <div className="cert-qr-label">Scan to Verify</div>
                        </div>

                    </div>
                    {/* └──────────────────────────────────────────┘ */}

                    {/* ┌───────────── FOOTER STRIP ──────────────────┐ */}
                    <div className="cert-footer-strip">
                        <div className="cert-footer-item">
                            Roll No:&nbsp;<span>{rollNo}</span>
                        </div>
                        <div className="cert-footer-item">
                            Certificate ID:&nbsp;<span>{certId}</span>
                        </div>
                        <div className="cert-footer-item">
                            Issue Date:&nbsp;<span>{issueDate}</span>
                        </div>
                    </div>
                    {/* └──────────────────────────────────────────┘ */}

                </div>{/* /cert-content */}
            </div>{/* /cert-document */}

        </div>
    );
};

export default CertificateTemplate;
