import React, { useState, useEffect, useMemo } from 'react';
import studentService from '../services/studentService';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { isAdmin, isAdminOrAM } from '../utils/auth';
import api from '../services/api';
import ImageEditorModal from '../components/ImageEditorModal';

const BASE_URL = 'http://localhost:8000';

const StudentDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const rollnoFromURL = searchParams.get("rollno");
    const sectionFromURL = searchParams.get("section");

    // State definitions
    const [searchQuery, setSearchQuery] = useState('');
    const [displayStudent, setDisplayStudent] = useState(null);
    const [showNoResults, setShowNoResults] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState(null); // 'term2' or 'term3'
    const [payAmount, setPayAmount] = useState('');
    const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [undoingId, setUndoingId] = useState(null);
    const [showIdTypeModal, setShowIdTypeModal] = useState(false);
    const [idProofFile, setIdProofFile] = useState(null);
    const [selectedIdType, setSelectedIdType] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editorFile, setEditorFile] = useState(null);
    const [editorField, setEditorField] = useState('');

    // Step 7: Invoice & Receipt state
    const [invoice, setInvoice] = useState(null);
    const [receipts, setReceipts] = useState([]);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [receiptsLoading, setReceiptsLoading] = useState(false);
    const [timeline, setTimeline] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [pendingSection, setPendingSection] = useState(null);

    // Group students by month for the browsing section
    const groupedStudents = useMemo(() => {
        if (!allStudents) return [];

        let filtered = allStudents;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = allStudents.filter(s =>
                s.full_name?.toLowerCase().includes(query) ||
                s.student_id?.toLowerCase().includes(query) ||
                s.phone?.includes(query)
            );
        }

        const groups = {};
        // Sort students by admission_date DESC (newest first)
        const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.admission_date || '1970-01-01');
            const dateB = new Date(b.admission_date || '1970-01-01');
            return dateB - dateA;
        });

        sorted.forEach(student => {
            if (!student.admission_date) return;
            const date = new Date(student.admission_date);
            // Example: February 2026
            const monthName = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const groupKey = `${monthName} ${year}`;

            // For sorting groups: 2026-02
            const groupSortKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    title: groupKey,
                    sortKey: groupSortKey,
                    students: []
                };
            }
            groups[groupKey].students.push(student);
        });

        // Sort groups by groupSortKey DESC (newest year/month first)
        return Object.values(groups).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
    }, [allStudents, searchQuery]);

    // Access Control for view
    useEffect(() => {
        const userData = localStorage.getItem('a3_campus_user');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    // Handle auto-load from URL search parameter
    useEffect(() => {
        if (rollnoFromURL) {
            console.log('[StudentDetails] Loading from URL rollno:', rollnoFromURL);
            setSearchQuery(rollnoFromURL);
            handleSearch(rollnoFromURL);

            // Handle section deep-linking from Global Search (e.g., ?section=invoice)
            if (sectionFromURL) {
                setPendingSection(sectionFromURL);
            }
        }
    }, [rollnoFromURL, sectionFromURL]);

    // Handle auto-search from navigation state (e.g., from Reports drill-down)
    useEffect(() => {
        if (location.state && location.state.autoSearch) {
            const sid = location.state.autoSearch;
            const targetSection = location.state.targetSection;

            console.log('[StudentDetails] Auto-searching from state:', sid, 'Target Section:', targetSection);
            setSearchQuery(sid);
            handleSearch(sid);

            if (targetSection) {
                setPendingSection(targetSection);
            }

            // Clear state to prevent re-search on refresh/re-navigation
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Handle Deep-linking to specific sections (Invoice/Receipt)
    useEffect(() => {
        if (displayStudent && pendingSection) {
            const timer = setTimeout(() => {
                if (pendingSection === 'invoice') {
                    loadInvoice();
                    const el = document.getElementById('invoice-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (pendingSection === 'receipt') {
                    loadReceipts();
                    const el = document.getElementById('receipt-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                setPendingSection(null);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [displayStudent, pendingSection]);

    // Fetch Student Timeline
    useEffect(() => {
        const fetchTimeline = async () => {
            if (!displayStudent || !displayStudent.rollNo) {
                setTimeline([]);
                return;
            }

            setTimelineLoading(true);
            try {
                // Use the new timeline endpoint
                const response = await api.get(`/students/${displayStudent.rollNo}/timeline/`);
                // Sort by date descending (already done by backend, but ensuring here)
                const sortedData = (response.data || []).sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                setTimeline(sortedData);
            } catch (error) {
                console.error('[StudentDetails] Error fetching student timeline:', error);
                setTimeline([]);
            } finally {
                setTimelineLoading(false);
            }
        };

        fetchTimeline();
    }, [displayStudent]);

    // Load all students on component mount
    useEffect(() => {
        const loadDefaultStudents = async () => {
            try {
                console.log('[StudentDetails] Loading all students on mount...');
                const students = await studentService.getStudentsByMonth();
                console.log('[StudentDetails] All students:', students);
                setAllStudents(students);
            } catch (error) {
                console.error('[StudentDetails] Error loading students:', error);
            }
        };

        const params = new URLSearchParams(window.location.search);
        const rollno = params.get("rollno");

        if (!rollno) {
            loadDefaultStudents();
        }
    }, []);

    // State reset on location change ONLY if no rollno/state is present
    useEffect(() => {
        window.scrollTo(0, 0);

        const hasRollNoInURL = new URLSearchParams(window.location.search).get("rollno");
        if (!hasRollNoInURL && !(location.state && location.state.autoSearch)) {
            console.log('[StudentDetails] Resetting state (Sidebar/Manual navigation)');
            setSearchQuery('');
            setDisplayStudent(null);
            setShowNoResults(false);
        }
    }, [location.pathname, location.search]);

    const abortControllerRef = React.useRef(null);

    // Reusable mapping: backend student data → frontend display format
    const mapStudentData = (found) => ({
        id: found.id,
        name: found.full_name,
        studentId: found.student_id,
        rollNo: found.student_id,
        email: found.email,
        phone: found.phone,
        dob: found.dob,
        age: found.age,
        gender: found.gender,
        category: found.education_level,
        bloodGroup: found.blood_group,
        address: found.address,
        guardian1Name: found.guardian1_name,
        guardian1Relation: found.guardian1_relation,
        guardian1Phone: found.guardian1_phone,
        guardian1Occupation: found.guardian1_occupation,
        guardian2Name: found.guardian2_name,
        guardian2Relation: found.guardian2_relation,
        guardian2Phone: found.guardian2_phone,
        guardian2Occupation: found.guardian2_occupation,
        educationLevel: found.education_level,
        collegeName: found.college_name,
        specialization: found.specialization,
        yearOfPassing: found.year_of_passing,
        marks: found.marks,
        experience: found.work_experience,
        yearsOfExperience: found.years_of_experience,
        profession: found.profession,
        companyName: found.company_name,
        designation: found.designation,
        skills: found.skills,
        course: found.courses && found.courses.length > 0 ? found.courses[0].course : 'N/A',
        coursesList: found.courses,
        semester: 'N/A',
        admissionDate: found.admission_date,
        status: found.status,
        totalFee: found.total_fee,
        discount: found.discount,
        finalFee: found.final_fee,
        paidAmount: found.paid_amount !== undefined ? Number(found.paid_amount) : 0,
        pendingAmount: found.pending_amount !== undefined ? Number(found.pending_amount) : Number(found.final_fee),
        feeStatus: found.fee_status === 'Fully Paid' ? 'Paid Fully' : (found.fee_status === 'Partially Paid' ? 'Pending' : found.fee_status),
        paymentScheme: found.payment_scheme === 'Installment' ? 'Term-wise' : 'One-time',
        paymentMode: found.payment_mode,
        installments: found.installments || {},
        certificateStatus: found.certificate_status,
        certificateApplied: found.certificate_applied,
        assignedTo: found.assigned_to,
        leadSource: found.lead_source,
        batch: found.batch,
        emergency: found.guardian1_phone || 'N/A',
        studentPhoto: found.student_photo,
        idProof: found.id_proof,
        idProofType: found.id_proof_type,
        custom_fields: found.custom_fields || []
    });

    // Re-fetch and re-map the currently displayed student (used after any update)
    const refreshCurrentStudent = async () => {
        if (!displayStudent) return;
        try {
            const results = await studentService.getAllStudents(displayStudent.student_id || displayStudent.rollNo);
            if (results && results.length > 0) {
                setDisplayStudent(mapStudentData(results[0]));
            }
            // Also refresh the sidebar student list
            const allStudents = await studentService.getStudentsByMonth();
            setAllStudents(allStudents);
        } catch (error) {
            console.error('[StudentDetails] Error refreshing student:', error);
        }
    };

    // handleSearch implementation
    async function handleSearch(query = searchQuery) {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            setDisplayStudent(null);
            setShowNoResults(false);
            return;
        }

        setIsLoading(true);
        setShowNoResults(false);
        setInvoice(null);
        setReceipts([]);

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            console.log(`[StudentDetails] Real-time searching for: "${trimmedQuery}"`);
            const results = await studentService.getAllStudents(trimmedQuery, abortControllerRef.current.signal);

            if (results && results.length > 0) {
                const found = results[0];
                console.log('[StudentDetails] Student found:', found);
                setDisplayStudent(mapStudentData(found));
                setShowNoResults(false);
            } else {
                setDisplayStudent(null);
                setShowNoResults(true);
            }
        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                console.log('[StudentDetails] Search request aborted.');
                return;
            }
            console.error('[StudentDetails] Error searching students:', error);
            setShowNoResults(true);
        } finally {
            if (abortControllerRef.current?.signal?.aborted) return;
            setIsLoading(false);
        }
    };

    // User-initiated search: searches API then navigates to Student Dashboard via URL
    const handleUserSearch = async (query = searchQuery) => {
        const trimmedQuery = (typeof query === 'string' ? query : searchQuery).trim();
        if (!trimmedQuery) {
            setDisplayStudent(null);
            setShowNoResults(false);
            return;
        }

        setIsLoading(true);
        setShowNoResults(false);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            const results = await studentService.getAllStudents(trimmedQuery, abortControllerRef.current.signal);
            if (results && results.length > 0) {
                const found = results[0];
                // Navigate to Student Dashboard via URL instead of setting state inline
                navigate(`/students?rollno=${found.student_id}`);
            } else {
                setDisplayStudent(null);
                setShowNoResults(true);
            }
        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'CanceledError') return;
            console.error('[StudentDetails] User search error:', error);
            setShowNoResults(true);
        } finally {
            if (abortControllerRef.current?.signal?.aborted) return;
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleUserSearch(searchQuery);
        }
    };

    const startEditing = (field, currentValue) => {
        setEditingField(field);
        setTempValue(currentValue);
    };

    const openPayModal = (term, amount) => {
        setSelectedTerm(term);
        setPayAmount(amount);
        setPayDate(new Date().toISOString().split('T')[0]);
        setShowPayModal(true);
    };

    const handlePaymentSubmit = async () => {
        if (!displayStudent || !selectedTerm) return;

        try {
            const actualAmount = Number(payAmount);
            const inst = { ...displayStudent.installments };
            const finalFee = Number(displayStudent.finalFee);

            // Normalize: Ensure expected amounts are preserved
            if (!inst.term1.expected) inst.term1.expected = Number(inst.term1.amount) || (finalFee * 0.5); // Fallback to 50% if unknown
            if (!inst.term2.expected) inst.term2.expected = Number(inst.term2.amount) || (finalFee * 0.25);
            if (!inst.term3.expected) inst.term3.expected = Number(inst.term3.amount) || (finalFee * 0.25);

            // Calculate current total paid (from JSON or sum)
            let currentTotalPaid = Number(inst.total_paid);
            if (isNaN(currentTotalPaid)) {
                // Fallback sum logic for legacy records
                currentTotalPaid = (Number(inst.term1.paid_amount) || (Number(inst.term1.amount) || 0));
                currentTotalPaid += (Number(inst.term2.paid_amount) || (inst.term2.status === 'Paid' ? Number(inst.term2.amount) : 0));
                currentTotalPaid += (Number(inst.term3.paid_amount) || (inst.term3.status === 'Paid' ? Number(inst.term3.amount) : 0));
            }

            const newTotalPaid = currentTotalPaid + actualAmount;
            inst.total_paid = newTotalPaid;

            // Record meta for specific transaction
            inst[selectedTerm].date = payDate;
            inst[selectedTerm].paid_amount = (Number(inst[selectedTerm].paid_amount) || 0) + actualAmount;

            // Derived Status Calculation (Cumulative Model)
            const t1Limit = inst.term1.expected;
            const t2Limit = t1Limit + inst.term2.expected;

            // Term 1 Status
            if (newTotalPaid >= t1Limit) {
                inst.term1.status = 'Paid';
                inst.term1.amount = 0;
            } else {
                inst.term1.status = 'Partially Paid';
                inst.term1.amount = t1Limit - newTotalPaid;
            }

            // Term 2 Status
            if (newTotalPaid >= t2Limit) {
                inst.term2.status = 'Paid';
                inst.term2.amount = 0;
            } else if (newTotalPaid > t1Limit) {
                inst.term2.status = 'Partially Paid';
                inst.term2.amount = t2Limit - newTotalPaid;
            } else {
                inst.term2.status = 'Pending';
                inst.term2.amount = inst.term2.expected;
            }

            // Term 3 Status
            if (newTotalPaid >= finalFee - 0.01) {
                inst.term3.status = 'Paid';
                inst.term3.amount = 0;
            } else if (newTotalPaid > t2Limit) {
                inst.term3.status = 'Partially Paid';
                inst.term3.amount = finalFee - newTotalPaid;
            } else {
                inst.term3.status = 'Pending';
                inst.term3.amount = inst.term3.expected;
            }

            // Determine Overall Fee Status
            const isFullyPaid = newTotalPaid >= finalFee - 0.01;
            const newFeeStatusBackend = isFullyPaid ? 'Fully Paid' : 'Partially Paid';
            const newFeeStatusFrontend = newFeeStatusBackend === 'Fully Paid' ? 'Paid Fully' : 'Pending';

            const patchData = {
                installments: inst,
                fee_status: newFeeStatusBackend
            };

            await studentService.updateStudent(displayStudent.id, patchData);

            // Re-fetch fresh data from server with proper mapping
            await refreshCurrentStudent();

            setShowPayModal(false);
            alert(isFullyPaid ? 'Full payment received! Student is now fully paid.' : 'Payment updated based on cumulative balance.');
        } catch (error) {
            console.error('[StudentDetails] Cumulative payment update failed:', error);
            alert('Failed to update payment. Please try again.');
        }
    };

    const handleApplyCertificate = async () => {
        if (!displayStudent) return;

        // Frontend validation: check pending balance
        const pendingBalance = displayStudent.pendingAmount !== undefined ? Number(displayStudent.pendingAmount) : 0;
        if (pendingBalance > 0 || (displayStudent.feeStatus !== 'Paid Fully' && displayStudent.feeStatus !== 'Fully Paid')) {
            alert('Certificate can be applied only after full payment.');
            return;
        }

        try {
            await studentService.updateStudent(displayStudent.id, {
                certificate_applied: true,
                certificate_status: 'Applied'
            });

            // Refresh student data from server
            await refreshCurrentStudent();

            alert('Certificate successfully applied. You will receive it soon.');
        } catch (error) {
            console.error('[StudentDetails] Certificate application failed:', error);
            // Show specific backend validation error if available
            const backendError = error.response?.data?.error;
            alert(backendError || 'Failed to apply for certificate. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!displayStudent) return;
        setIsDeleting(true);
        try {
            await studentService.deleteStudent(displayStudent.id);
            alert('Student deleted successfully.');
            setShowDeleteConfirm(false);
            setDisplayStudent(null);
            setSearchQuery('');
            // Refresh list too
            const students = await studentService.getStudentsByMonth();
            setAllStudents(students);
            navigate('/students'); // Redirect to search view
        } catch (error) {
            console.error('[StudentDetails] Deletion failed:', error);
            alert(error.response?.data?.error || 'Failed to delete student. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteClickRollNo = async (rollNo) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await studentService.deleteStudentByRollNo(rollNo);
                alert("Student deleted successfully");
                // Refresh the list
                const students = await studentService.getStudentsByMonth();
                setAllStudents(students);
            } catch (error) {
                console.error("Deletion failed:", error);
                alert(error.response?.data?.error || "Failed to delete student");
            }
        }
    };

    const saveEdit = async (field) => {
        if (!displayStudent) return;

        // Phone validation if field is phone related
        if (['phone', 'guardian1Phone', 'guardian2Phone'].includes(field)) {
            if (tempValue.length !== 10) {
                alert("Phone number must be exactly 10 digits.");
                return;
            }
        }

        try {
            // Map frontend field back to backend field or aliases
            const backendFieldMap = {
                name: 'name', // Alias handled by serializer
                phone: 'phone',
                email: 'email',
                course: 'course', // Alias handled by serializer
                totalFee: 'total_fee',
                discount: 'discount',
                finalFee: 'final_fee',
                paidAmount: 'paid_amount', // Field handled by serializer
                paymentScheme: 'payment_type', // Alias handled by serializer
                paymentMode: 'payment_mode',
                assignedTo: 'assigned_to',
                leadSource: 'lead_source',
                guardian1Name: 'guardian1_name',
                guardian1Phone: 'guardian1_phone',
                guardian1Relation: 'guardian1_relation',
                guardian1Occupation: 'guardian1_occupation',
                guardian2Name: 'guardian2_name',
                guardian2Phone: 'guardian2_phone',
                guardian2Relation: 'guardian2_relation',
                dob: 'dob',
                age: 'age',
                gender: 'gender',
                bloodGroup: 'blood_group',
                address: 'address',
                educationLevel: 'education_level',
                collegeName: 'college_name',
                specialization: 'specialization',
                yearOfPassing: 'year_of_passing',
                marks: 'marks',
                batch: 'batch',
                status: 'status'
            };

            const backendField = backendFieldMap[field] || field;
            await studentService.updateStudent(displayStudent.id, { [backendField]: tempValue });

            // Re-fetch fresh data from server with proper mapping
            await refreshCurrentStudent();
            setEditingField(null);
            alert("Student details updated successfully");
        } catch (error) {
            console.error(`Failed to update ${field}`, error);

            let errorMessage = 'Failed to update student details. Please try again.';

            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const errors = [];
                    for (const [f, messages] of Object.entries(data)) {
                        const msg = Array.isArray(messages) ? messages[0] : messages;
                        errors.push(`${f}: ${msg}`);
                    }
                    if (errors.length > 0) {
                        errorMessage = `Update failed:\n- ${errors.join('\n- ')}`;
                    }
                } else if (typeof data === 'string') {
                    errorMessage = data;
                }
            }

            alert(errorMessage);
        }
    };

    const saveCustomEdit = async (valueId, newValue) => {
        if (!displayStudent) return;
        setIsLoading(true);
        try {
            await studentService.updateCustomFieldValue(valueId, newValue);

            // Update local state
            setDisplayStudent(prev => ({
                ...prev,
                custom_fields: prev.custom_fields.map(f =>
                    f.id === valueId ? { ...f, value: newValue } : f
                )
            }));

            setEditingField(null);
            alert("Custom field updated successfully");
        } catch (error) {
            console.error("Failed to update custom field", error);
            alert("Failed to update custom field. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const openHistory = async () => {
        if (!displayStudent) return;
        setHistoryOpen(true);
        try {
            const res = await api.get(`/students/${displayStudent.id}/history/`);
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching history:", error);
            alert("Failed to fetch history");
        }
    };

    const undoHistory = async (historyId) => {
        if (!window.confirm('Are you sure you want to undo this change?')) return;
        if (!displayStudent) return;

        setUndoingId(historyId);
        try {
            await api.post(`/students/${displayStudent.id}/undo/`, { history_id: historyId });
            alert('Change reverted successfully');
            // Refresh student data with proper mapping
            await refreshCurrentStudent();
            // Refresh history list
            const histRes = await api.get(`/students/${displayStudent.id}/history/`);
            setHistory(histRes.data);
        } catch (error) {
            console.error('Failed to undo:', error);
            alert(error.response?.data?.error || 'Failed to revert change');
        } finally {
            setUndoingId(null);
        }
    };

    const handleFileUpdate = async (field, file) => {
        if (!file || !displayStudent) return;

        const MAX_FILE_SIZE = 25600; // 25 KB
        if (file.size > MAX_FILE_SIZE) {
            alert("File size must be below 25 KB");
            return;
        }

        if (field === 'student_photo' || field === 'id_proof') {
            // Bypass editor for PDFs
            if (file.type === 'application/pdf') {
                if (field === 'id_proof') {
                    setIdProofFile(file);
                    setSelectedIdType(displayStudent.idProofType || '');
                    setShowIdTypeModal(true);
                }
                return;
            }
            setEditorFile(file);
            setEditorField(field);
            setShowEditor(true);
            return;
        }

        setIsLoading(true);

        try {
            // Fallback for any other file fields if any
            const formData = new FormData();
            formData.append(field, file);
            await studentService.updateStudent(displayStudent.id, formData);

            // Refresh display student with proper mapping
            await refreshCurrentStudent();
            alert(`${field === 'student_photo' ? 'Photo' : 'ID Proof'} updated successfully`);
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            const backendError = error.response?.data?.error || error.response?.data?.[field]?.[0];
            alert(backendError || `Failed to update ${field}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditorSave = async (editedFile) => {
        const MAX_FILE_SIZE = 25600; // 25 KB
        if (editedFile.size > MAX_FILE_SIZE) {
            alert("Edited file is too large (must be below 25 KB). Try zooming out or a different crop.");
            return;
        }

        setShowEditor(false);
        setIsLoading(true);

        try {
            if (editorField === 'student_photo') {
                await studentService.uploadPhoto(displayStudent.id, editedFile);
                await refreshCurrentStudent();
                alert("Photo updated successfully");
            } else if (editorField === 'id_proof') {
                setIdProofFile(editedFile);
                setSelectedIdType(displayStudent.idProofType || '');
                setShowIdTypeModal(true);
            }
        } catch (error) {
            console.error(`Error uploading edited ${editorField}:`, error);
            const backendError = error.response?.data?.error || "Failed to upload edited file";
            alert(backendError);
        } finally {
            setIsLoading(false);
            setEditorFile(null);
            setEditorField('');
        }
    };

    const handleIdTypeSubmit = async () => {
        if (!selectedIdType) {
            alert("Please select ID Proof Type");
            return;
        }
        if (!idProofFile || !displayStudent) return;

        setIsLoading(true);
        setShowIdTypeModal(false);

        try {
            await studentService.uploadIdProof(displayStudent.id, idProofFile, selectedIdType);
            await refreshCurrentStudent();
            alert("ID Proof updated successfully");
        } catch (error) {
            console.error("Error uploading ID proof:", error);
            const backendError = error.response?.data?.error || "Failed to upload ID proof";
            alert(backendError);
        } finally {
            setIsLoading(false);
            setIdProofFile(null);
        }
    };

    // Step 7: Load Invoice for current student
    const loadInvoice = async () => {
        if (!displayStudent) return;
        setInvoiceLoading(true);
        try {
            const res = await api.get(`/invoice/${displayStudent.id}/`);
            setInvoice(res.data);
        } catch (error) {
            if (error.response?.status === 404) {
                setInvoice(null);
                alert('No invoice found for this student.');
            } else {
                console.error('[Invoice] Error loading:', error);
                alert('Failed to load invoice.');
            }
        } finally {
            setInvoiceLoading(false);
        }
    };

    // Step 7: Load Receipts for current student
    const loadReceipts = async () => {
        if (!displayStudent) return;
        setReceiptsLoading(true);
        try {
            const res = await api.get(`/student-receipts/${displayStudent.id}/`);
            const data = res.data;

            if (data.status === "success") {
                setReceipts(data.receipts);
            } else if (data.status === "empty") {
                alert(data.message || "No receipts available for this student.");
                setReceipts([]);
            } else {
                alert(data.message || "Error loading receipts");
            }
        } catch (error) {
            console.error('[Receipts] Error loading:', error);
            alert('Failed to load receipts.');
        } finally {
            setReceiptsLoading(false);
        }
    };

    const downloadReceipt = async (receiptId, rollNo) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/download-receipt/${receiptId}/`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                alert("Failed to download receipt");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${rollNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Receipt download failed:', err);
            alert("Error downloading receipt");
        }
    };

    const renderEditableField = (label, field, type = 'text', options = [], colClass = "col-6") => {
        const isEditing = editingField === field;
        const value = displayStudent ? displayStudent[field] : '';

        return (
            <div className={`${colClass} detail-item mb-2`}>
                <div className="detail-label">{label}</div>
                <div className="detail-value-wrapper">
                    {!isEditing ? (
                        <>
                            <span className={`detail-value ${field === 'status' && value === 'Active' ? 'text-success' : ''} ${field === 'feeStatus' && (value === 'Paid Fully' || value === 'Fully Paid') ? 'text-primary' : ''} ${field === 'feeStatus' && (value === 'Pending' || value === 'Partially Paid') ? 'text-warning' : ''}`}>
                                {value || 'N/A'}
                            </span>
                            {isAdminOrAM() && (
                                <i className="bi bi-pencil edit-icon" onClick={() => startEditing(field, value)}></i>
                            )}
                        </>
                    ) : (
                        <div className="d-flex align-items-center gap-2 w-100">
                            {type === 'select' ? (
                                <select
                                    className="editable-input flex-grow-1"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    autoFocus
                                >
                                    <option value="">Select...</option>
                                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input
                                    type={type}
                                    className="editable-input flex-grow-1"
                                    value={tempValue}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (['phone', 'guardian1Phone', 'guardian2Phone'].includes(field)) {
                                            val = val.replace(/[^0-9]/g, '').slice(0, 10);
                                        }
                                        setTempValue(val);
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            saveEdit(field);
                                        }
                                        if (['phone', 'guardian1Phone', 'guardian2Phone'].includes(field)) {
                                            if (!/[0-9]/.test(e.key)) e.preventDefault();
                                        }
                                    }}
                                    autoFocus
                                />
                            )}
                            <i className="bi bi-check-lg edit-icon text-success" onClick={() => saveEdit(field)} title="Save"></i>
                            <i className="bi bi-x-lg edit-icon text-danger" onClick={() => setEditingField(null)} title="Cancel"></i>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCustomFields = (tabName, colClass = "col-6") => {
        if (!displayStudent || !displayStudent.custom_fields || !Array.isArray(displayStudent.custom_fields)) return null;

        const standardTabs = ['ABOUT', 'EDUCATION', 'COURSE', 'PARENT'];

        const filtered = displayStudent.custom_fields.filter(f => {
            const fTab = (f.tab || '').toUpperCase();
            if (tabName === 'OTHER') {
                return !standardTabs.includes(fTab);
            }
            return fTab === (tabName || '').toUpperCase();
        });

        if (filtered.length === 0) return null;

        return filtered.map((field, idx) => {
            const isEditing = editingField === `custom_${field.id}`;
            const value = field.value;

            return (
                <div className={`${colClass} detail-item mb-2`} key={field.field_name || idx}>
                    <div className="detail-label">{field.field_label}</div>
                    <div className="detail-value-wrapper">
                        {!isEditing ? (
                            <>
                                <span className="detail-value">
                                    {field.field_type === 'File Upload' && field.value ? (
                                        <a href={`http://localhost:8000/media/${field.value}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-link p-0 text-decoration-none" style={{ fontSize: '0.85rem' }}>
                                            <i className="bi bi-file-earmark-arrow-down me-1"></i>View File
                                        </a>
                                    ) : field.field_type === 'Checkbox' ? (
                                        (field.value === 'true' || field.value === true) ? 'Yes' : 'No'
                                    ) : field.value || 'N/A'}
                                </span>
                                {isAdminOrAM() && field.field_type !== 'File Upload' && (
                                    <i className="bi bi-pencil edit-icon" onClick={() => startEditing(`custom_${field.id}`, value)}></i>
                                )}
                            </>
                        ) : (
                            <div className="d-flex align-items-center gap-2 w-100">
                                {field.field_type === 'Dropdown' ? (
                                    <select
                                        className="editable-input flex-grow-1"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        autoFocus
                                    >
                                        <option value="">Select...</option>
                                        {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : field.field_type === 'Checkbox' ? (
                                    <div className="form-check m-0 d-flex align-items-center">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={tempValue === 'true' || tempValue === true}
                                            onChange={(e) => setTempValue(e.target.checked)}
                                            autoFocus
                                        />
                                        <label className="form-check-label ms-1 small">Yes</label>
                                    </div>
                                ) : (
                                    <input
                                        type={field.field_type === 'Number' ? 'number' : field.field_type === 'Date' ? 'date' : 'text'}
                                        className="editable-input flex-grow-1"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                saveCustomEdit(field.id, tempValue);
                                            }
                                        }}
                                        autoFocus
                                    />
                                )}
                                <i className="bi bi-check-lg edit-icon text-success" onClick={() => saveCustomEdit(field.id, tempValue)} title="Save"></i>
                                <i className="bi bi-x-lg edit-icon text-danger" onClick={() => setEditingField(null)} title="Cancel"></i>
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="fade-in">
            {/* Search Section */}
            <div className="student-search-container">
                <div className="card card-custom p-4">
                    <h5 className="mb-3 fw-bold">Find Student</h5>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search by Name, Student ID or Roll No..."
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                if (!val.trim()) {
                                    setDisplayStudent(null);
                                    setShowNoResults(false);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn btn-primary" onClick={() => handleUserSearch()}>Search</button>
                    </div>
                </div>
            </div>

            {/* Month-wise Student List Section */}
            {!displayStudent && (
                <div className="month-wise-students-section mb-4 fade-in">
                    <div className="card card-custom p-4">
                        <h5 className="mb-4 fw-bold text-primary">
                            <i className="bi bi-calendar3 me-2"></i>
                            Students by Month
                        </h5>

                        <div className="students-scroll-area" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' }}>
                            {groupedStudents.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-people fs-1 mb-3 opacity-25"></i>
                                    <p>No students found</p>
                                </div>
                            ) : (
                                groupedStudents.map(group => (
                                    <div key={group.title} className="month-group mb-5">
                                        <h6 className="month-group-title fw-bold border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 10, padding: '10px 0' }}>
                                            <span className="text-primary">{group.title}</span>
                                            <span className="badge bg-light text-dark fw-normal">{group.students.length} Students</span>
                                        </h6>

                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0 shadow-sm border rounded overflow-hidden">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="ps-3" style={{ fontSize: '0.85rem' }}>Student Name</th>
                                                        <th style={{ fontSize: '0.85rem' }}>Course</th>
                                                        <th style={{ fontSize: '0.85rem' }}>Phone</th>
                                                        <th style={{ fontSize: '0.85rem' }}>Roll No</th>
                                                        <th style={{ fontSize: '0.85rem' }}>Batch</th>
                                                        <th style={{ fontSize: '0.85rem' }}>Admission Date</th>
                                                        <th className="text-end pe-3" style={{ fontSize: '0.85rem' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.students.map(student => (
                                                        <tr key={student.id}>
                                                            <td className="ps-3">
                                                                <button
                                                                    className="btn btn-link p-0 fw-bold underline-hover text-primary text-decoration-none text-start"
                                                                    onClick={() => navigate(`/students?rollno=${student.student_id}`)}
                                                                >
                                                                    {student.full_name}
                                                                </button>
                                                            </td>
                                                            <td className="text-secondary small">{student.courses && student.courses.length > 0 ? student.courses.map(c => c.course).join(', ') : 'N/A'}</td>
                                                            <td className="small" style={{ fontFamily: 'monospace', color: '#475569' }}>{student.phone}</td>
                                                            <td className="small">{student.student_id}</td>
                                                            <td className="small">
                                                                <span className="badge bg-light text-dark border">{student.batch || 'FULL'}</span>
                                                            </td>
                                                            <td className="small">{student.admission_date}</td>
                                                            <td className="text-end pe-3">
                                                                <div className="d-flex justify-content-end gap-2">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                                        onClick={() => navigate(`/students?rollno=${student.student_id}`)}
                                                                    >
                                                                        View
                                                                    </button>
                                                                    {isAdmin() && (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                                            onClick={() => handleDeleteClickRollNo(student.student_id)}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Results Area */}
            {displayStudent && (
                <div className="row justify-content-center fade-in">
                    <div className="col-lg-10">
                        <div className="profile-card">
                            <div className="profile-header-strip"></div>
                            <div className="text-center">
                                <div className="profile-avatar-wrapper position-relative mx-auto" style={{ width: '120px' }}>
                                    <div className="profile-avatar mx-auto" style={{ width: '120px', height: '120px' }}>
                                        {displayStudent.studentPhoto ? (
                                            <img
                                                src={displayStudent.photoUrl || (displayStudent.studentPhoto.startsWith('http') ? displayStudent.studentPhoto : `${BASE_URL}${displayStudent.studentPhoto}`)}
                                                alt="Student"
                                                className="rounded-circle w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="bg-light rounded-circle w-100 h-100 d-flex align-items-center justify-content-center border shadow-sm">
                                                <i className="bi bi-person-fill text-secondary" style={{ fontSize: '4rem' }}></i>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1 shadow"
                                        style={{ cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, border: '2px solid white' }}
                                        onClick={() => document.getElementById('photoUpload').click()}
                                        title="Upload Photo"
                                    >
                                        <i className="bi bi-camera-fill" style={{ fontSize: '0.9rem' }}></i>
                                    </div>
                                    <input
                                        type="file"
                                        id="photoUpload"
                                        className="d-none"
                                        accept="image/jpeg,image/jpg"
                                        onChange={(e) => handleFileUpdate('student_photo', e.target.files[0])}
                                    />
                                </div>
                                <div className="mt-2 mb-3">
                                    <small className="text-muted" style={{ fontSize: '0.65rem' }}>jpg, jpeg max 25kb is allowed *</small>
                                </div>

                                <h3 className="mb-2 fw-bold">
                                    {renderEditableField('', 'name', 'text', [], 'd-inline-block')}
                                    {isAdmin() && (
                                        <button
                                            className="btn btn-link text-danger p-0 ms-2"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            title="Delete Student"
                                        >
                                            <i className="bi bi-trash-fill fs-5"></i>
                                        </button>
                                    )}
                                </h3>

                                <div className="d-flex flex-column align-items-center gap-1 mb-3">
                                    <div className="d-flex justify-content-center gap-2">
                                        {isAdmin() && (
                                            <button
                                                className="btn btn-xs btn-sm btn-outline-secondary d-flex align-items-center py-1 px-2"
                                                onClick={openHistory}
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                <i className="bi bi-clock-history me-1"></i> View History
                                            </button>
                                        )}

                                        <a
                                            href={displayStudent.idProof ? (displayStudent.idProof.startsWith('http') ? displayStudent.idProof : `${BASE_URL}${displayStudent.idProof}`) : '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`btn btn-xs btn-sm btn-outline-info d-flex align-items-center py-1 px-2 ${!displayStudent.idProof ? 'disabled' : ''}`}
                                            style={{ fontSize: '0.75rem', pointerEvents: !displayStudent.idProof ? 'none' : 'auto', opacity: !displayStudent.idProof ? 0.5 : 1 }}
                                        >
                                            <i className="bi bi-file-earmark-text me-1"></i> View ID Proof
                                        </a>

                                        <button
                                            className="btn btn-xs btn-sm btn-outline-primary d-flex align-items-center py-1 px-2"
                                            onClick={() => document.getElementById('idProofUpload').click()}
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            <i className="bi bi-upload me-1"></i> Update ID
                                        </button>
                                        <input
                                            type="file"
                                            id="idProofUpload"
                                            className="d-none"
                                            accept=".pdf,image/jpeg,image/jpg"
                                            onChange={(e) => handleFileUpdate('id_proof', e.target.files[0])}
                                        />
                                    </div>
                                    <small className="text-muted" style={{ fontSize: '0.65rem' }}>pdf, jpg, jpeg max 25kb is allowed *</small>
                                </div>
                                <p className="text-muted">{displayStudent.rollNo} | {displayStudent.studentId}</p>
                            </div>

                            <div className="row g-0 mt-4 px-3 pb-4">
                                {/* Personal Info */}
                                <div className="col-md-6 info-section border-md-end">
                                    <h6 className="section-title text-primary fw-bold mb-3"><i className="bi bi-person me-2"></i>Personal Information</h6>
                                    <div className="row g-3">
                                        {renderEditableField('DOB', 'dob', 'date')}
                                        {renderEditableField('Age', 'age', 'number')}
                                        {renderEditableField('Gender', 'gender', 'select', ['Male', 'Female', 'Other'])}
                                        {renderEditableField('Blood Group', 'bloodGroup')}
                                        {renderEditableField('Batch', 'batch', 'select', ['FULL', 'FN', 'AN', 'ONLINE'])}
                                        {renderEditableField('Phone', 'phone')}
                                        {renderCustomFields('ABOUT')}
                                    </div>
                                </div>

                                {/* Academic Details */}
                                <div className="col-md-6 info-section">
                                    <h6 className="section-title text-primary fw-bold mb-3"><i className="bi bi-book me-2"></i>Academic History</h6>
                                    <div className="row g-3">
                                        {renderEditableField('Edu Level', 'educationLevel')}
                                        {renderEditableField('College', 'collegeName')}
                                        {renderEditableField('Specialization', 'specialization')}
                                        {renderEditableField('Year', 'yearOfPassing')}
                                        {renderEditableField('Marks', 'marks')}
                                        {renderCustomFields('EDUCATION')}
                                    </div>
                                </div>

                                {/* Additional Information Block for Other tabs */}
                                {displayStudent && displayStudent.custom_fields && displayStudent.custom_fields.some(f =>
                                    !['ABOUT', 'EDUCATION', 'COURSE', 'PARENT'].includes((f.tab || '').toUpperCase())
                                ) && (
                                        <div className="col-md-12 info-section mt-4 border-top pt-4">
                                            <h6 className="section-title text-primary fw-bold mb-3"><i className="bi bi-plus-circle me-2"></i>Additional Information</h6>
                                            <div className="row g-3">
                                                {renderCustomFields('OTHER', 'col-md-4')}
                                            </div>
                                        </div>
                                    )}

                                {/* Student Timeline */}
                                <div className="col-md-12 info-section mt-4 border-top pt-4">
                                    <div className="timeline-container">
                                        <h4 className="fw-bold mb-4">Student Timeline</h4>

                                        {timelineLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading timeline...</span>
                                                </div>
                                            </div>
                                        ) : timeline.length === 0 ? (
                                            <p className="text-muted">No Timeline Available</p>
                                        ) : (
                                            timeline.map((log, index) => (
                                                <div key={index} className="timeline-item">
                                                    <div className="timeline-dot"></div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-date">{log.timestamp}</div>
                                                        <div className="timeline-user text-primary">{log.user}</div>
                                                        <div className="timeline-text text-secondary">{log.description}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                                        .timeline-container {
                                            margin-top: 30px;
                                            padding-left: 20px;
                                            position: relative;
                                        }
                                        .timeline-container::before {
                                            content: "";
                                            position: absolute;
                                            left: 10px;
                                            top: 0;
                                            bottom: 0;
                                            width: 3px;
                                            background: #007bff;
                                        }
                                        .timeline-item {
                                            position: relative;
                                            margin-bottom: 25px;
                                            padding-left: 30px;
                                        }
                                        .timeline-dot {
                                            position: absolute;
                                            left: 3px;
                                            top: 5px;
                                            width: 14px;
                                            height: 14px;
                                            border-radius: 50%;
                                            background: #007bff;
                                            border: 3px solid white;
                                            box-shadow: 0 0 5px rgba(0,0,0,0.3);
                                        }
                                        .timeline-content {
                                            background: #f8f9fa;
                                            padding: 10px 15px;
                                            border-radius: 8px;
                                            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                                        }
                                        .timeline-date {
                                            font-size: 12px;
                                            color: #777;
                                        }
                                        .timeline-user {
                                            font-weight: bold;
                                            margin-top: 3px;
                                        }
                                        .timeline-text {
                                            margin-top: 5px;
                                            font-size: 0.9rem;
                                        }
                                    `}} />
                                </div>

                                {/* Guardian Info */}
                                <div className="col-md-12 info-section mt-4 border-top pt-4">
                                    <h6 className="section-title text-primary fw-bold mb-3"><i className="bi bi-people me-2"></i>Guardian Information</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6 border-end">
                                            <div className="row g-2">
                                                {renderEditableField('Guardian 1 Name', 'guardian1Name', 'text', [], 'col-md-6')}
                                                {renderEditableField('Guardian 1 Phone', 'guardian1Phone', 'text', [], 'col-md-6')}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="row g-2">
                                                {renderEditableField('Guardian 2 Name', 'guardian2Name', 'text', [], 'col-md-6')}
                                                {renderEditableField('Guardian 2 Phone', 'guardian2Phone', 'text', [], 'col-md-6')}
                                            </div>
                                        </div>
                                        <div className="col-md-12 border-top mt-3 pt-3">
                                            {renderEditableField('Residential Address', 'address', 'text', [], 'col-md-12')}
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Background */}
                                {displayStudent.experience === 'experienced' && (
                                    <div className="col-md-12 info-section mt-4 border-top pt-4">
                                        <h6 className="section-title text-primary fw-bold mb-3"><i className="bi bi-briefcase me-2"></i>Professional Background</h6>
                                        <div className="row g-3">
                                            <div className="col-md-3">
                                                <div className="detail-label">Profession</div>
                                                <div className="detail-value">{displayStudent.profession}</div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="detail-label">Years of Exp</div>
                                                <div className="detail-value">{displayStudent.yearsOfExperience} Years</div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="detail-label">Company</div>
                                                <div className="detail-value">{displayStudent.companyName}</div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="detail-label">Skills</div>
                                                <div className="detail-value">{displayStudent.skills}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Course & Fee Summary */}
                                <div className="col-md-12 info-section mt-4 border-top pt-4">
                                    <h6 className="section-title text-primary fw-bold mb-3"><i className="bi bi-currency-dollar me-2"></i>Course & Fee Summary</h6>
                                    <div className="row g-3">
                                        {renderEditableField('Enrolled Courses', 'course', 'text', [], 'col-md-3')}
                                        {renderEditableField('Total Fee', 'totalFee', 'number', [], 'col-md-2')}
                                        {renderEditableField('Discount', 'discount', 'number', [], 'col-md-2')}
                                        {renderEditableField('Final Fee', 'finalFee', 'number', [], 'col-md-2')}
                                    </div>
                                    <div className="row g-3 mt-1">
                                        {renderEditableField('Paid Amount', 'paidAmount', 'number', [], 'col-md-3 border-start ps-3')}
                                        <div className="col-md-3">
                                            <div className="detail-label text-danger">Pending Balance</div>
                                            <div className="detail-value fw-bold text-danger">₹{Number(displayStudent.pendingAmount || 0).toLocaleString()}</div>
                                        </div>
                                        {renderEditableField('Payment Type', 'paymentScheme', 'select', ['One-time', 'Term-wise'], 'col-md-3')}
                                        {renderEditableField('Payment Mode', 'paymentMode', 'select', ['CASH', 'GPAY', 'OTHER'], 'col-md-3')}
                                    </div>
                                </div>

                                {/* Certificate Application */}
                                <div className="col-md-12 info-section mt-4 border-top pt-4">
                                    <h6 className="section-title text-primary fw-bold mb-3"><i className="bi bi-award me-2"></i>Certificate</h6>
                                    <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                                        <div>
                                            <div className="small text-muted mb-1">Current Status</div>
                                            <div className={`fw-bold ${displayStudent.certificateApplied ? 'text-success' : 'text-warning'}`}>
                                                {displayStudent.certificateApplied ? 'Certificate Applied' : 'Needs to Apply'}
                                            </div>
                                        </div>
                                        {Number(displayStudent.pendingAmount || 0) === 0 && !displayStudent.certificateApplied && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleApplyCertificate}
                                            >
                                                <i className="bi bi-send-fill me-2"></i>Apply for Certificate
                                            </button>
                                        )}
                                        {displayStudent.certificateApplied && (
                                            <span className="badge bg-success p-2">
                                                <i className="bi bi-check-circle-fill me-2"></i>Certificate Applied
                                            </span>
                                        )}
                                    </div>
                                    {((displayStudent.feeStatus !== 'Paid Fully' && displayStudent.feeStatus !== 'Fully Paid') || Number(displayStudent.pendingAmount || 0) > 0) && (
                                        <div className="small text-danger mt-2">
                                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                            Certificate can be applied only after full payment.
                                            {Number(displayStudent.pendingAmount || 0) > 0 && (
                                                <span className="fw-bold"> Pending Balance: ₹{Number(displayStudent.pendingAmount).toLocaleString()}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Step 7: Invoice Section */}
                                <div className="col-md-12 info-section mt-4 border-top pt-4" id="invoice-section">
                                    <h6 className="section-title text-primary fw-bold mb-3">
                                        <i className="bi bi-file-earmark-text me-2"></i>Invoice
                                    </h6>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <button
                                            className="btn btn-outline-primary rounded-pill px-4"
                                            onClick={loadInvoice}
                                            disabled={invoiceLoading}
                                        >
                                            {invoiceLoading ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Loading...</>
                                            ) : (
                                                <><i className="bi bi-eye me-2"></i>View Invoice</>
                                            )}
                                        </button>
                                    </div>
                                    {invoice && !invoice.error && (
                                        <div className="bg-light p-3 rounded border">
                                            <div className="row g-3">
                                                <div className="col-md-3">
                                                    <div className="small text-muted">Invoice No</div>
                                                    <div className="fw-bold text-primary">{invoice.invoice_number}</div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="small text-muted">Total Fee</div>
                                                    <div className="fw-bold">₹{Number(invoice.total_fee).toLocaleString()}</div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="small text-muted">Discount</div>
                                                    <div className="fw-bold text-success">₹{Number(invoice.discount).toLocaleString()}</div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="small text-muted">Final Fee</div>
                                                    <div className="fw-bold text-dark">₹{Number(invoice.final_fee).toLocaleString()}</div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="small text-muted">Date</div>
                                                    <div className="fw-bold">{invoice.date}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Step 7: Receipts Section */}
                                <div className="col-md-12 info-section mt-4 border-top pt-4" id="receipt-section">
                                    <h6 className="section-title text-primary fw-bold mb-3">
                                        <i className="bi bi-receipt me-2"></i>Payment Receipts
                                    </h6>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <button
                                            className="btn btn-outline-success rounded-pill px-4"
                                            onClick={loadReceipts}
                                            disabled={receiptsLoading}
                                        >
                                            {receiptsLoading ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Loading...</>
                                            ) : (
                                                <><i className="bi bi-receipt-cutoff me-2"></i>Load Receipts</>
                                            )}
                                        </button>
                                        {receipts.length > 0 && (
                                            <span className="badge bg-success rounded-pill">{receipts.length} Receipt(s)</span>
                                        )}
                                    </div>
                                    {receipts.length > 0 && (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0 shadow-sm border rounded overflow-hidden">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="ps-3" style={{ fontSize: '0.85rem' }}>Receipt No</th>
                                                        <th style={{ fontSize: '0.85rem' }}>Amount Paid</th>
                                                        <th style={{ fontSize: '0.85rem' }}>Payment Mode</th>
                                                        <th style={{ fontSize: '0.85rem' }}>Date</th>
                                                        <th className="text-end pe-3" style={{ fontSize: '0.85rem' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {receipts.map((r, idx) => (
                                                        <tr key={idx}>
                                                            <td className="ps-3 fw-bold text-primary">{r.receipt_no}</td>
                                                            <td className="fw-bold">₹{Number(r.amount).toLocaleString()}</td>
                                                            <td>
                                                                <span className="badge bg-light text-dark border">{r.payment_mode}</span>
                                                            </td>
                                                            <td className="small text-muted">{r.date}</td>
                                                            <td className="text-end pe-3">
                                                                <button
                                                                    className="btn btn-sm btn-success rounded-pill px-3"
                                                                    onClick={() => downloadReceipt(r.id, displayStudent.rollNo)}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Contact & Metadata */}
                                <div className="col-md-12 info-section mt-4 border-top pt-4">
                                    <div className="row g-3">
                                        {renderEditableField('Email', 'email', 'email', [], 'col-md-4')}
                                        {renderEditableField('Source', 'leadSource', 'text', [], 'col-md-4')}
                                        {renderEditableField('Assigned To', 'assignedTo', 'select', ['ADMIN', 'CRE', 'AM', 'BDE', 'CRO', 'CRO-1', 'CRO-2'], 'col-md-4')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Installment Info */}
                        {(displayStudent.feeStatus === 'Partially Paid' || displayStudent.feeStatus === 'Pending') && displayStudent.installments && (
                            <div className="col-md-12 info-section mt-4 bg-white rounded shadow-sm p-4">
                                <h6 className="section-title text-primary"><i className="bi bi-calendar-check me-2"></i>Payment Installments</h6>
                                <div className="row g-3 text-center">
                                    <div className="col-md-4">
                                        <div className="p-3 border rounded bg-light">
                                            <div className="detail-label">Term 1 (Paid)</div>
                                            <div className="detail-value fw-bold text-success">₹ {displayStudent.installments?.term1?.amount || '0'}</div>
                                            <div className="small text-muted">{displayStudent.installments?.term1?.date}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 border rounded bg-light">
                                            <div className="detail-label d-flex justify-content-between align-items-center">
                                                <span>Term 2</span>
                                                {displayStudent.installments?.term2?.status === 'Paid' ? (
                                                    <span className="badge bg-success-subtle text-success small">Paid</span>
                                                ) : (
                                                    <button
                                                        className="btn btn-xs btn-outline-primary py-0 px-2"
                                                        style={{ fontSize: '0.65rem', height: '18px', lineHeight: '1' }}
                                                        onClick={() => openPayModal('term2', displayStudent.installments?.term2?.amount)}
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                            <div className="detail-value fw-bold text-primary">₹ {displayStudent.installments?.term2?.amount || '0'}</div>
                                            <div className="small text-muted">
                                                {displayStudent.installments?.term2?.status === 'Paid' ? (
                                                    `Paid on: ${displayStudent.installments?.term2?.date}`
                                                ) : (
                                                    `Next Due: ${displayStudent.installments?.term2?.date || 'N/A'}`
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 border rounded bg-light">
                                            <div className="detail-label d-flex justify-content-between align-items-center">
                                                <span>Term 3</span>
                                                {displayStudent.installments?.term3?.status === 'Paid' ? (
                                                    <span className="badge bg-success-subtle text-success small">Paid</span>
                                                ) : (
                                                    <button
                                                        className="btn btn-xs btn-outline-primary py-0 px-2"
                                                        style={{ fontSize: '0.65rem', height: '18px', lineHeight: '1' }}
                                                        onClick={() => openPayModal('term3', displayStudent.installments?.term3?.amount)}
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                            <div className="detail-value fw-bold text-primary">₹ {displayStudent.installments?.term3?.amount || '0'}</div>
                                            <div className="small text-muted">
                                                {displayStudent.installments?.term3?.status === 'Paid' ? (
                                                    `Paid on: ${displayStudent.installments?.term3?.date}`
                                                ) : (
                                                    `Next Due: ${displayStudent.installments?.term3?.date || 'N/A'}`
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No Results */}
            {showNoResults && (
                <div className="text-center py-5 fade-in">
                    <i className="bi bi-search" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
                    <h4 className="mt-3 text-muted">No student found</h4>
                    <p className="text-muted small">Try searching with a different name, roll no or student ID</p>
                </div>
            )}

            {/* Payment Modal */}
            {showPayModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header bg-primary text-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-credit-card-2-front me-2"></i>
                                    Update Payment: {selectedTerm === 'term2' ? 'Term 2' : 'Term 3'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPayModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Payment Amount (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">₹</span>
                                        <input
                                            type="number"
                                            className="form-control border-start-0"
                                            value={payAmount}
                                            onChange={(e) => setPayAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Payment Date</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-calendar-event"></i></span>
                                        <input
                                            type="date"
                                            className="form-control border-start-0"
                                            value={payDate}
                                            onChange={(e) => setPayDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="alert alert-info py-2 small d-flex align-items-center">
                                    <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                                    Confirming this will mark the installment as paid and update the student's fee status.
                                </div>
                            </div>
                            <div className="modal-footer border-0 pb-4 px-4">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowPayModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary rounded-pill px-4" onClick={handlePaymentSubmit}>Confirm Payment</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header bg-danger text-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Confirm Deletion
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteConfirm(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <i className="bi bi-trash text-danger" style={{ fontSize: '3rem' }}></i>
                                <h5 className="mt-3 fw-bold">Permanent Action</h5>
                                <p className="text-muted">
                                    Are you sure you want to permanently delete <strong>{displayStudent.name}</strong>?
                                    <br />
                                    This action cannot be undone and will hide the student from all records.
                                </p>
                            </div>
                            <div className="modal-footer border-0 pb-4 px-4 justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-pill px-4"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger rounded-pill px-4"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Confirm Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {historyOpen && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Student Change History</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setHistoryOpen(false)}></button>
                            </div>
                            <div className="modal-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light sticky-top">
                                        <tr>
                                            <th className="px-3">Date</th>
                                            <th>Field</th>
                                            <th>Old Value</th>
                                            <th>New Value</th>
                                            <th>User</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length > 0 ? (
                                            history.map((h) => (
                                                <tr key={h.id}>
                                                    <td className="px-3 small">{h.changed_at}</td>
                                                    <td><span className="badge bg-light text-dark">{h.field_name}</span></td>
                                                    <td className="small">{h.old_value}</td>
                                                    <td className="small">{h.new_value}</td>
                                                    <td className="small">{h.changed_by}</td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-warning py-0 px-2"
                                                            style={{ fontSize: '11px' }}
                                                            onClick={() => undoHistory(h.id)}
                                                            disabled={undoingId === h.id}
                                                        >
                                                            {undoingId === h.id ? (
                                                                <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }}></span>
                                                            ) : (
                                                                <><i className="bi bi-arrow-counterclockwise me-1"></i>Undo</>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">No history found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setHistoryOpen(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ID Proof Type Modal */}
            {showIdTypeModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header bg-primary text-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-file-earmark-check me-2"></i>
                                    Update ID Proof
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowIdTypeModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Select ID Proof Type:</label>
                                    <select
                                        className="form-select border-primary-subtle"
                                        value={selectedIdType}
                                        onChange={(e) => setSelectedIdType(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Type --</option>
                                        <option value="Aadhar">Aadhar</option>
                                        <option value="PAN">PAN</option>
                                        <option value="Driving License">Driving License</option>
                                    </select>
                                </div>
                                <div className="alert alert-light border small text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Selected file: {idProofFile?.name}
                                </div>
                            </div>
                            <div className="modal-footer border-0 pb-4 px-4">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowIdTypeModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary rounded-pill px-4" onClick={handleIdTypeSubmit}>OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Editor Modal */}
            {showEditor && editorFile && (
                <ImageEditorModal
                    file={editorFile}
                    onClose={() => {
                        setShowEditor(false);
                        setEditorFile(null);
                        setEditorField('');
                    }}
                    onSave={handleEditorSave}
                    aspect={editorField === 'student_photo' ? 1 : 16 / 9} // Square for photo, wide for ID
                />
            )}
        </div>
    );
};

export default StudentDetails;
