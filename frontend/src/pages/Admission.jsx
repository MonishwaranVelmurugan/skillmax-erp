import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import leadService from '../services/leadService';
import { getDefaultAssignedTo, canModifyAssignedTo, isAdmin } from '../utils/auth';

const COURSE_DATA = {
    'Digital Marketing': {
        'graphic designer': 15000,
        'SEO': 12000,
        'Marketing developer': 20000,
        'Poster designer': 10000,
        'Digital Marketing': 18000
    },
    'Industrial Automation': {
        'ASE': 25000,
        'AASP4': 30000,
        'AASP6': 35000,
        'PDIA': 40000,
        'APPP': 45000
    },
    'Embedded systems': {
        'CESE': 28000,
        'CEDP': 32000,
        'CEE': 35000,
        'Embedded Systems': 30000
    },
    'IT': {
        'Fullstack development': 45000,
        'Full Stack Development': 45000,
        'Java Full Stack': 40000,
        'PYTHON': 25000,
        'AI/ML': 50000,
        'Data sceince': 55000,
        'Data Science': 55000,
        'Data Analyst': 40000,
        'Testing': 20000,
        'IoT': 30000
    },
    'BMS': {
        'CCTV': 10000,
        'BMS': 15000
    }
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Admission = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('about');
    const [canModifyRole] = useState(canModifyAssignedTo());
    const userRole = localStorage.getItem("role") || '';
    const [assignedTo, setAssignedTo] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        // Personal
        fullName: '',
        email: '',
        batch: '',
        dob: '',
        age: '',
        phone: '',
        address: '',
        experience: 'fresher',
        leadSource: '',
        assignedTo: '',
        photo: null,
        idProofType: '',
        idProof: null,
        gender: '',
        bloodGroup: '',

        // Parent
        guardian1Name: '',
        guardian1Occupation: '',
        guardian1Relation: '',
        guardian1Phone: '',
        guardian2Name: '',
        guardian2Occupation: '',
        guardian2Relation: '',
        guardian2Phone: '',

        // Education
        educationLevel: '',
        collegeName: '',
        specialization: '',
        yearOfPassing: '',
        marks: '',

        // Experience Details
        yearsOfExperience: '',
        profession: '',
        companyName: '',
        designation: '',
        skills: '',

        // Courses & Fees
        courses: [{ id: 1, category: '', course: '', fee: '' }],
        feeStatus: 'Partially Paid',
        paymentScheme: 'Installment',
        paymentMode: 'CASH',
        discountType: 'amount', // 'amount' or 'percent'
        discountValue: '',
        installments: {
            term1: { amount: '', date: new Date().toISOString().split('T')[0] },
            term2: { amount: '', date: '' },
            term3: { amount: '', date: '' }
        },
        custom_fields: {}
    });

    const [customFields, setCustomFields] = useState([]);
    const [showAddFieldModal, setShowAddFieldModal] = useState(false);
    const [newField, setNewField] = useState({
        field_label: '',
        field_type: 'Text',
        placeholder: '',
        required: false,
        options: '',
        tab_name: ''
    });

    const [totalPrice, setTotalPrice] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    // Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

    useEffect(() => {
        if (userRole) {
            setAssignedTo(userRole);
            setFormData(prev => ({ ...prev, assignedTo: userRole }));
        }
    }, [userRole]);

    useEffect(() => {
        const fetchCustomFields = async () => {
            try {
                const fields = await studentService.getCustomFields();
                setCustomFields(fields);

                const customValues = {};
                fields.forEach(f => {
                    customValues[f.field_name] = '';
                });

                setFormData(prev => ({
                    ...prev,
                    custom_fields: {
                        ...prev.custom_fields,
                        ...customValues
                    }
                }));
            } catch (error) {
                console.error("Error fetching custom fields:", error);
            }
        };
        fetchCustomFields();
    }, []);

    // State reset on location change
    useEffect(() => {
        window.scrollTo(0, 0);
        setActiveTab('about');
        setFormData(prev => ({
            ...prev,
            fullName: '',
            email: '',
            batch: '',
            dob: '',
            age: '',
            phone: '',
            address: '',
            experience: 'fresher',
            leadSource: '',
            assignedTo: userRole || "",
            photo: null,
            idProofType: '',
            idProof: null,
            gender: '',
            bloodGroup: '',
            guardian1Name: '',
            guardian1Occupation: '',
            guardian1Relation: '',
            guardian1Phone: '',
            guardian2Name: '',
            guardian2Occupation: '',
            guardian2Relation: '',
            guardian2Phone: '',
            educationLevel: '',
            collegeName: '',
            specialization: '',
            yearOfPassing: '',
            marks: '',
            yearsOfExperience: '',
            profession: '',
            companyName: '',
            designation: '',
            skills: '',
            courses: [{ id: 1, category: '', course: '', fee: '' }],
            feeStatus: 'Partially Paid',
            paymentScheme: 'Installment',
            paymentMode: 'CASH',
            discountType: 'amount',
            discountValue: '',
            installments: {
                term1: { amount: '', date: new Date().toISOString().split('T')[0] },
                term2: { amount: '', date: '' },
                term3: { amount: '', date: '' }
            },
            custom_fields: { ...prev.custom_fields } // keep field names, clear values if needed (but here we just keep the structure)
        }));
        setTotalPrice(0);
        setFinalPrice(0);
    }, [location]);

    const handleAddField = async () => {
        if (!newField.field_label || !newField.field_type) {
            alert("Field Label and Type are required");
            return;
        }
        try {
            const optionsArray = newField.options
                ? newField.options.split(",").map(o => o.trim()).filter(o => o !== "")
                : [];

            const payload = {
                ...newField,
                field_name: newField.field_label.toLowerCase().replace(/\s+/g, '_'),
                field_type: newField.field_type.toLowerCase(),
                options: optionsArray
            };

            await studentService.addCustomField(payload);

            // Re-fetch custom fields to ensure consistency and get the complete object
            const fields = await studentService.getCustomFields();
            setCustomFields(fields);

            setFormData(prev => ({
                ...prev,
                custom_fields: {
                    ...prev.custom_fields,
                    [payload.field_name]: ''
                }
            }));
            setShowAddFieldModal(false);
            setNewField({
                field_label: '',
                field_type: 'Text',
                placeholder: '',
                required: false,
                options: '',
                tab_name: ''
            });
            alert("Custom field added successfully");
        } catch (error) {
            console.error(error.response);
            alert(error.response?.data?.message || error.response?.data || "Failed to add custom field");
        }
    };

    const renderCustomFields = (tabName) => {
        return customFields
            .filter(f => f.tab_name === tabName && f.is_active)
            .map(f => {
                const fType = f.field_type.toLowerCase();
                return (
                    <div className="col-md-4" key={f.id}>
                        <label className="form-label">
                            {f.field_label}{f.required && <span className="text-danger">*</span>}
                        </label>
                        {fType === 'dropdown' ? (
                            <select
                                className="form-select"
                                value={formData.custom_fields[f.field_name] || ''}
                                onChange={(e) => handleCustomFieldChange(f.field_name, e.target.value)}
                                required={f.required}
                            >
                                <option value="">Choose...</option>
                                {f.options && Array.isArray(f.options) && f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        ) : fType === 'checkbox' ? (
                            <div className="form-check mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={formData.custom_fields[f.field_name] === 'true'}
                                    onChange={(e) => handleCustomFieldChange(f.field_name, e.target.checked ? 'true' : 'false')}
                                    required={f.required}
                                />
                                <label className="form-check-label">{f.placeholder || f.field_label}</label>
                            </div>
                        ) : fType === 'file upload' || fType === 'file' ? (
                            <input
                                type="file"
                                className="form-control"
                                onChange={(e) => handleCustomFieldChange(f.field_name, e.target.files[0])}
                                required={f.required}
                            />
                        ) : fType === 'date' ? (
                            <input
                                type="date"
                                className="form-control"
                                value={formData.custom_fields[f.field_name] || ''}
                                onChange={(e) => handleCustomFieldChange(f.field_name, e.target.value)}
                                required={f.required}
                            />
                        ) : fType === 'number' ? (
                            <input
                                type="number"
                                className="form-control"
                                placeholder={f.placeholder}
                                value={formData.custom_fields[f.field_name] || ''}
                                onChange={(e) => handleCustomFieldChange(f.field_name, e.target.value)}
                                required={f.required}
                            />
                        ) : (
                            <input
                                type="text"
                                className="form-control"
                                placeholder={f.placeholder}
                                value={formData.custom_fields[f.field_name] || ''}
                                onChange={(e) => handleCustomFieldChange(f.field_name, e.target.value)}
                                required={f.required}
                            />
                        )}
                    </div>
                );
            });
    };

    const handleCustomFieldChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            custom_fields: {
                ...prev.custom_fields,
                [fieldName]: value
            }
        }));
    };

    // Auto-populate logic
    useEffect(() => {
        // Try to get data from navigation state first, then localStorage (fallback)
        let leadData = location.state?.walkInLeadData;
        if (!leadData) {
            try {
                leadData = JSON.parse(localStorage.getItem('walkInLeadData') || '{}');
            } catch (e) { }
        }

        if (leadData && Object.keys(leadData).length > 0) {
            setFormData(prev => {
                const newData = { ...prev };
                if (leadData.name) newData.fullName = leadData.name;
                if (leadData.phone) newData.phone = leadData.phone;
                if (leadData.email) newData.email = leadData.email;
                if (leadData.dob) newData.dob = leadData.dob;
                if (leadData.education) newData.educationLevel = leadData.education;
                if (leadData.leadSource) newData.leadSource = leadData.leadSource;
                if (leadData.assignedTo) newData.assignedTo = leadData.assignedTo;

                // Handle Course
                let foundCategory = leadData.courseCategory || '';
                if (leadData.course) {
                    if (!foundCategory) {
                        for (const cat in COURSE_DATA) {
                            if (COURSE_DATA[cat][leadData.course]) {
                                foundCategory = cat;
                                break;
                            }
                        }
                    }
                    if (foundCategory) {
                        newData.courses = [{ id: 1, category: foundCategory, course: leadData.course, fee: '' }];
                    }
                }
                return newData;
            });

            if (leadData.dob) {
                calculateAge(leadData.dob);
            }
        }
    }, [location.state]);

    // Recalculate totals when courses change
    useEffect(() => {
        const total = formData.courses.reduce((sum, item) => sum + Number(item.fee || 0), 0);
        setTotalPrice(total);
        setFinalPrice(total); // Reset final price on course change, logic could be improved to keep discount
    }, [formData.courses]);

    const calculateAge = (dobValue) => {
        if (!dobValue) return;
        const dob = new Date(dobValue);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        setFormData(prev => ({ ...prev, dob: dobValue, age }));
    };

    const handleInputChange = (e) => {
        const { id, name, value, type, files } = e.target;
        const fieldName = name || id; // Use name if available, else id

        // Phone Validation (Student, Guardian 1, Guardian 2)
        if (['phone', 'guardian1Phone', 'guardian2Phone'].includes(fieldName)) {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
            return;
        }

        if (type === 'file') {
            const file = files[0];
            const MAX_FILE_SIZE = 25600; // 25 KB
            if (file && file.size > MAX_FILE_SIZE) {
                alert("File size must be below 25 KB");
                e.target.value = null; // Clear the input
                return;
            }
            setFormData(prev => ({ ...prev, [fieldName]: file }));
        } else {
            // Auto-set paymentScheme if feeStatus changes to Partially Paid
            if (fieldName === 'feeStatus' && value === 'Partially Paid') {
                setFormData(prev => ({ ...prev, [fieldName]: value, paymentScheme: 'Installment' }));
            } else if (fieldName === 'feeStatus' && value === 'Fully Paid') {
                setFormData(prev => ({ ...prev, [fieldName]: value, paymentScheme: 'One-time' }));
            } else {
                setFormData(prev => ({ ...prev, [fieldName]: value }));
            }
        }

        if (id === 'dob') {
            calculateAge(value);
        }
    };

    // Course management
    const addCourse = () => {
        setFormData(prev => ({
            ...prev,
            courses: [...prev.courses, { id: Date.now(), category: '', course: '', fee: '' }]
        }));
    };

    const removeCourse = (id) => {
        setFormData(prev => ({
            ...prev,
            courses: prev.courses.filter(c => c.id !== id)
        }));
    };

    const updateCourse = (id, field, value) => {
        setFormData(prev => {
            const newCourses = prev.courses.map(c => {
                if (c.id === id) {
                    const updated = { ...c, [field]: value };
                    // Reset sub-fields if category changes
                    if (field === 'category') {
                        updated.course = '';
                        updated.fee = '';
                    }
                    // Reset fee when course changes as per requirement
                    if (field === 'course') {
                        updated.fee = '';
                    }
                    return updated;
                }
                return c;
            });
            return { ...prev, courses: newCourses };
        });
    };

    const handleInstallmentChange = (term, field, value) => {
        setFormData(prev => {
            const newInstallments = { ...prev.installments };

            // Update the specific field
            newInstallments[term] = {
                ...newInstallments[term],
                [field]: value
            };

            // Reset logic: If Term 1 is invalid/cleared, reset Term 2 & 3
            if (term === 'term1') {
                const isTerm1Valid = newInstallments.term1.amount && Number(newInstallments.term1.amount) > 0 && newInstallments.term1.date;
                if (!isTerm1Valid) {
                    newInstallments.term2 = { amount: '', date: '' };
                    newInstallments.term3 = { amount: '', date: '' };
                }
            } else if (term === 'term2') {
                // If Term 2 is invalid/cleared, reset Term 3
                const isTerm2Valid = newInstallments.term2.amount && Number(newInstallments.term2.amount) > 0 && newInstallments.term2.date;
                if (!isTerm2Valid) {
                    newInstallments.term3 = { amount: '', date: '' };
                }
            }

            return { ...prev, installments: newInstallments };
        });
    };

    const applyDiscount = () => {
        if (!formData.discountValue) return;
        let discount = 0;
        let val = formData.discountValue;

        if (val.toString().includes('%')) {
            const percent = parseFloat(val.replace('%', ''));
            discount = (totalPrice * percent) / 100;
        } else {
            discount = parseFloat(val);
        }
        setFinalPrice(totalPrice - discount);
    };

    const isTabValid = (tab) => {
        const customFieldsForTab = customFields.filter(f => f.tab_name === tab && f.is_active && f.required);
        const requiredCustomFieldsFilled = customFieldsForTab.every(f => {
            const val = formData.custom_fields[f.field_name];
            return val !== undefined && val !== null && val.toString().trim() !== '';
        });

        if (!requiredCustomFieldsFilled) return false;

        switch (tab) {
            case 'about':
                return (
                    formData.fullName.trim() !== '' &&
                    formData.email.trim() !== '' &&
                    validateEmail(formData.email) &&
                    formData.phone.length === 10 &&
                    formData.batch !== ''
                );
            case 'course':
                const allCoursesSelected = formData.courses.length > 0 && formData.courses.every(c => c.category && c.course && c.fee > 0);
                const installmentsValid = formData.feeStatus === 'Partially Paid' ?
                    Math.abs((Number(formData.installments.term1.amount) + Number(formData.installments.term2.amount) + Number(formData.installments.term3.amount)) - finalPrice) < 0.01 : true;
                return (
                    allCoursesSelected &&
                    formData.paymentMode &&
                    formData.feeStatus &&
                    installmentsValid
                );
            case 'education':
                return (
                    formData.educationLevel !== '' &&
                    formData.collegeName.trim() !== '' &&
                    formData.specialization.trim() !== '' &&
                    formData.yearOfPassing.trim() !== ''
                );
            case 'parent':
                return (
                    formData.guardian1Name.trim() !== '' &&
                    formData.guardian1Relation.trim() !== '' &&
                    formData.guardian1Phone.length === 10
                );
            case 'overall':
                return isTabValid('about') && isTabValid('course') && isTabValid('education') && isTabValid('parent');
            default:
                return true;
        }
    };

    const handleTabClick = (tab) => {
        const tabsOrder = ['about', 'course', 'education', 'parent', 'overall'];
        const targetIndex = tabsOrder.indexOf(tab);
        const currentIndex = tabsOrder.indexOf(activeTab);

        if (targetIndex < currentIndex) {
            setActiveTab(tab);
            return;
        }

        for (let i = 0; i < targetIndex; i++) {
            if (!isTabValid(tabsOrder[i])) {
                return;
            }
        }
        setActiveTab(tab);
    };

    // Confirmation Modal Logic
    const timerRef = useRef(null);

    const openConfirmModal = () => {
        // Validation for Installments
        if (formData.feeStatus === 'Partially Paid') {
            const { term1, term2, term3 } = formData.installments;

            // Term 1 mandatory
            if (!term1.amount || Number(term1.amount) <= 0 || !term1.date) {
                alert('Term 1 Amount and Date are required for Installment scheme.');
                return;
            }

            // Term 2 consistency
            if ((term2.amount && !term2.date) || (!term2.amount && term2.date)) {
                alert('Both Amount and Date are required for Term 2 if used.');
                return;
            }

            // Term 3 consistency
            if ((term3.amount && !term3.date) || (!term3.amount && term3.date)) {
                alert('Both Amount and Date are required for Term 3 if used.');
                return;
            }

            // Sum Validation
            const totalInstallment = (Number(term1.amount) || 0) + (Number(term2.amount) || 0) + (Number(term3.amount) || 0);
            if (Math.abs(totalInstallment - finalPrice) >= 0.01) {
                alert(`Total installment amount (₹${totalInstallment}) must exactly match the target fee (₹${finalPrice}).`);
                return;
            }
        }

        setShowConfirmModal(true);
        setCountdown(5);
        setIsConfirmEnabled(false);
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setIsConfirmEnabled(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleCancelConfirm = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setShowConfirmModal(false);
        setCountdown(5);
        setIsConfirmEnabled(false);
    };

    const handleFinalSubmit = async () => {
        // Validation for Phone Numbers
        if (formData.phone.length !== 10) {
            alert('Student Phone number must be exactly 10 digits.');
            return;
        }
        if (formData.guardian1Phone && formData.guardian1Phone.length !== 10) {
            alert('Guardian 1 Phone number must be exactly 10 digits.');
            return;
        }
        if (formData.guardian2Phone && formData.guardian2Phone.length > 0 && formData.guardian2Phone.length !== 10) {
            alert('Guardian 2 Phone number must be exactly 10 digits.');
            return;
        }

        // Validate required custom fields
        const missingFields = [];
        customFields.forEach(f => {
            if (f.is_active && f.required) {
                const val = formData.custom_fields[f.field_name];
                if (!val || (typeof val === 'string' && val.trim() === '')) {
                    missingFields.push(f.field_label);
                }
            }
        });
        if (missingFields.length > 0) {
            alert(`Please fill in the following required fields:\n\n${missingFields.join('\n')}`);
            return;
        }

        try {
            const installments = (() => {
                const rich = { ...formData.installments };
                if (formData.feeStatus === 'Fully Paid' || formData.paymentScheme === 'One-time') {
                    rich.total_paid = finalPrice;
                    rich.term1 = {
                        amount: 0,
                        expected: finalPrice,
                        paid_amount: finalPrice,
                        status: 'Paid',
                        date: new Date().toISOString().split('T')[0]
                    };
                } else {
                    const t1Amt = Number(formData.installments.term1.amount) || 0;
                    const t2Amt = Number(formData.installments.term2.amount) || 0;
                    const t3Amt = Number(formData.installments.term3.amount) || 0;

                    rich.total_paid = t1Amt;
                    rich.term1 = { ...rich.term1, expected: t1Amt, paid_amount: t1Amt, status: 'Paid', amount: 0 };
                    rich.term2 = { ...rich.term2, expected: t2Amt, paid_amount: 0, status: 'Pending', amount: t2Amt };
                    rich.term3 = { ...rich.term3, expected: t3Amt, paid_amount: 0, status: 'Pending', amount: t3Amt };
                }
                return rich;
            })();

            // Create FormData for submission to support file uploads
            const studentFormData = new FormData();

            // Map frontend fields to backend fields
            const fieldMap = {
                fullName: 'full_name',
                email: 'email',
                phone: 'phone',
                dob: 'dob',
                age: 'age',
                address: 'address',
                gender: 'gender',
                bloodGroup: 'blood_group',
                guardian1Name: 'guardian1_name',
                guardian1Occupation: 'guardian1_occupation',
                guardian1Relation: 'guardian1_relation',
                guardian1Phone: 'guardian1_phone',
                guardian2Name: 'guardian2_name',
                guardian2Occupation: 'guardian2_occupation',
                guardian2Relation: 'guardian2_relation',
                guardian2Phone: 'guardian2_phone',
                educationLevel: 'education_level',
                collegeName: 'college_name',
                specialization: 'specialization',
                yearOfPassing: 'year_of_passing',
                marks: 'marks',
                experience: 'work_experience',
                yearsOfExperience: 'years_of_experience',
                profession: 'profession',
                companyName: 'company_name',
                designation: 'designation',
                skills: 'skills',
                feeStatus: 'fee_status',
                paymentScheme: 'payment_scheme',
                paymentMode: 'payment_mode',
                batch: 'batch',
                assignedTo: 'assigned_to',
                leadSource: 'lead_source',
                idProofType: 'id_proof_type'
            };

            Object.keys(fieldMap).forEach(key => {
                // Only append if the value is not null, undefined, or an empty string (for optional fields)
                // This prevents backend validation errors for Integer/Date fields that shouldn't be empty strings
                if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
                    studentFormData.append(fieldMap[key], formData[key]);
                }
            });

            // Append calculated fields (ensure they are non-empty)
            studentFormData.append('total_fee', totalPrice || 0);
            studentFormData.append('discount', (totalPrice - finalPrice) || 0);
            studentFormData.append('final_fee', finalPrice || 0);

            // Append complex fields as JSON strings
            studentFormData.append('courses', JSON.stringify(formData.courses));
            studentFormData.append('installments', JSON.stringify(installments));

            // Handle Custom Fields - Separate files from text
            const customFieldsText = { ...formData.custom_fields };
            customFields.forEach(f => {
                const val = formData.custom_fields[f.field_name];
                if (f.field_type === 'File Upload' && val instanceof File) {
                    studentFormData.append(`custom_file_${f.field_name}`, val);
                    customFieldsText[f.field_name] = "__FILE__"; // Placeholder for backend
                }
            });
            studentFormData.append('custom_fields', JSON.stringify(customFieldsText));

            // Append files with correct backend names
            if (formData.photo) {
                studentFormData.append('student_photo', formData.photo);
            }
            if (formData.idProof) {
                studentFormData.append('id_proof', formData.idProof);
            }

            const response = await studentService.createStudent(studentFormData);
            const data = await response.json();

            if (response.ok) {
                // Update lead status if this was a walk-in conversion
                const walkInData = location.state?.walkInLeadData;
                if (walkInData?.leadId) {
                    try {
                        await leadService.updateLeadStatus(walkInData.leadId, 'Converted');
                    } catch (leadError) { }
                }

                alert(data.message || `Admission completed successfully\n\nStudent ID: ${data.student_id || data.id}`);
                localStorage.removeItem('walkInLeadData');
                setShowConfirmModal(false);

                if (walkInData?.leadId) {
                    navigate('/leads/followup');
                } else {
                    navigate('/dashboard');
                }
            } else {
                let errorMessage = data.error || "Admission failed";
                // Detail dictionary fallback
                if (typeof data === 'object' && !data.error && !data.message) {
                    const errors = [];
                    for (const [field, messages] of Object.entries(data)) {
                        const msg = Array.isArray(messages) ? messages[0] : messages;
                        errors.push(`${field}: ${msg}`);
                    }
                    if (errors.length > 0) errorMessage = `Validation failed:\n- ${errors.join('\n- ')}`;
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error submitting admission:', error);
            alert("No response from server or network error.");
        }
    };

    return (
        <div className="fade-in">
            <div className="card card-custom p-0 overflow-hidden">
                <div className="card-header-clean p-4 border-bottom bg-white">
                    <h4 className="fw-bold mb-1">Student Admission Form</h4>
                    <p className="text-muted mb-0">Complete all required information across the tabs below.</p>
                </div>

                <div className="card-body p-4">
                    {/* Tabs */}
                    <ul className="nav nav-tabs mb-4">
                        {['about', 'course', 'education', 'parent', 'overall'].map((tab, idx, arr) => {
                            const tabsOrder = ['about', 'course', 'education', 'parent', 'overall'];
                            const isPrevTabsValid = tabsOrder.slice(0, tabsOrder.indexOf(tab)).every(t => isTabValid(t));

                            return (
                                <li className="nav-item" key={tab}>
                                    <button
                                        className={`nav-link ${activeTab === tab ? 'active' : ''} ${!isPrevTabsValid ? 'disabled' : ''}`}
                                        onClick={() => isPrevTabsValid && setActiveTab(tab)}
                                        style={!isPrevTabsValid ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                                    >
                                        <span className="text-capitalize">{tab}</span>
                                        {isTabValid(tab) && tab !== 'overall' && <i className="bi bi-check-circle-fill ms-2 text-success" style={{ fontSize: '0.8rem' }}></i>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* About Tab */}
                    {activeTab === 'about' && (
                        <div className="fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Personal & Course Information</h5>
                                {isAdmin() && (
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                            setNewField({ ...newField, tab_name: 'about' });
                                            setShowAddFieldModal(true);
                                        }}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i> Add Field
                                    </button>
                                )}
                            </div>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Full Name<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="fullName" value={formData.fullName} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email ID<span className="text-danger">*</span></label>
                                    <input type="email" className="form-control" id="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Date of Birth</label>
                                    <input type="date" className="form-control" id="dob" value={formData.dob} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Age</label>
                                    <input type="number" className="form-control" readOnly value={formData.age} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Phone<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${formData.phone && formData.phone.length !== 10 ? 'is-invalid' : ''}`}
                                        id="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="10-digit number"
                                        required
                                    />
                                    {formData.phone && formData.phone.length !== 10 && (
                                        <div className="invalid-feedback">Must be exactly 10 digits.</div>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Gender</label>
                                    <select className="form-select" id="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Choose...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Blood Group</label>
                                    <select className="form-select" id="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}>
                                        <option value="">Choose...</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Batch<span className="text-danger">*</span></label>
                                    <select className="form-select" id="batch" value={formData.batch} onChange={handleInputChange} required>
                                        <option value="">Choose Batch...</option>
                                        <option value="FULL">Full</option>
                                        <option value="FN">FN</option>
                                        <option value="AN">AN</option>
                                        <option value="ONLINE">ONLINE</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Student Photo</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="photo"
                                        accept="image/jpeg,image/png"
                                        onChange={handleInputChange}
                                    />
                                    <div className="form-text" id="fmsg12">jpg, jpeg max 25kb is allowed*</div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">ID Proof</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="idProof"
                                        accept=".pdf,image/jpeg,image/png"
                                        onChange={handleInputChange}
                                    />
                                    <div className="form-text" id="fsaw33">pdf, jpg, jpeg max 25kb is allowed*</div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">ID Proof Type</label>
                                    <select className="form-select" id="idProofType" value={formData.idProofType} onChange={handleInputChange}>
                                        <option value="">Select Type...</option>
                                        <option value="Aadhar">Aadhar</option>
                                        <option value="PAN">PAN</option>
                                        <option value="Driving License">Driving License</option>
                                        <option value="Voter ID">Voter ID</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Address</label>
                                    <textarea className="form-control" id="address" rows="3" value={formData.address} onChange={handleInputChange}></textarea>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Work Experience</label>
                                    <div className="d-flex gap-3 mt-2">
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="experience" id="fresher" value="fresher" checked={formData.experience === 'fresher'} onChange={handleInputChange} />
                                            <label className="form-check-label" htmlFor="fresher">Fresher</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="experience" id="experienced" value="experienced" checked={formData.experience === 'experienced'} onChange={handleInputChange} />
                                            <label className="form-check-label" htmlFor="experienced">Experienced</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Assigned To</label>
                                    <select
                                        className="form-select"
                                        id="assignedTo"
                                        value={assignedTo}
                                        onChange={(e) => {
                                            setAssignedTo(e.target.value);
                                            handleInputChange(e);
                                        }}
                                        disabled={!canModifyRole}
                                    >
                                        <option value="">Choose...</option>
                                        <option value="CRE">CRE</option>
                                        <option value="CRO">CRO</option>
                                        <option value="CRO-1">CRO-1</option>
                                        <option value="CRO-2">CRO-2</option>
                                        <option value="BDE">BDE</option>
                                        <option value="AM">AM</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                    {!canModifyRole && (
                                        <small className="text-muted">Auto-assigned to your role</small>
                                    )}
                                </div>
                                <div className="col-12 mt-4 text-end">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => isTabValid('about') && setActiveTab('course')}
                                        disabled={!isTabValid('about')}
                                    >
                                        Next: Course Details <i className="bi bi-arrow-right"></i>
                                    </button>
                                    {!isTabValid('about') && (
                                        <div className="text-danger small mt-2">Please fill all required fields (*) with valid data to proceed.</div>
                                    )}
                                </div>
                            </div>

                            {/* Custom Fields for About Tab */}
                            {customFields.some(f => f.tab_name === 'about' && f.is_active) && (
                                <div className="mt-4 border-top pt-4">
                                    <h6 className="text-muted mb-3">Additional Information</h6>
                                    <div className="row g-3">
                                        {renderCustomFields('about')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Course Tab */}
                    {activeTab === 'course' && (
                        <div className="fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Course Selection & Fee Details</h5>
                                {isAdmin() && (
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                            setNewField({ ...newField, tab_name: 'course' });
                                            setShowAddFieldModal(true);
                                        }}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i> Add Field
                                    </button>
                                )}
                            </div>
                            {formData.courses.map((row, index) => (
                                <div className="row g-3 mb-3 align-items-end" key={row.id}>
                                    <div className="col-md-4">
                                        <label className="form-label">Category<span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={row.category}
                                            onChange={(e) => updateCourse(row.id, 'category', e.target.value)}
                                        >
                                            <option value="">Choose Category...</option>
                                            {Object.keys(COURSE_DATA).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Course<span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={row.course}
                                            onChange={(e) => updateCourse(row.id, 'course', e.target.value)}
                                            disabled={!row.category}
                                        >
                                            <option value="">Choose Course...</option>
                                            {row.category && Object.keys(COURSE_DATA[row.category]).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Fee<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter Course Fee"
                                            value={row.fee}
                                            onChange={(e) => updateCourse(row.id, 'fee', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-1">
                                        {formData.courses.length > 1 && (
                                            <button className="btn btn-outline-danger" onClick={() => removeCourse(row.id)}><i className="bi bi-trash"></i></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-sm btn-outline-primary mb-4" onClick={addCourse}><i className="bi bi-plus-lg"></i> Add Another Course</button>

                            <div className="card bg-light border-0 p-3 mb-4">
                                <div className="row align-items-center g-3">
                                    <div className="col-md-4">
                                        <button className="btn btn-outline-secondary w-100" onClick={() => setShowDiscountInput(!showDiscountInput)}>Give Discount</button>
                                    </div>
                                    {showDiscountInput && (
                                        <div className="col-md-4">
                                            <div className="input-group">
                                                <input type="text" className="form-control" placeholder="10% or 500" id="discountValue" value={formData.discountValue} onChange={handleInputChange} />
                                                <button className="btn btn-outline-success" onClick={applyDiscount}>Apply</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="row mt-3 border-top pt-3">
                                    <div className="col-6 text-end"><span className="fs-5 fw-bold text-muted">Total Price:</span></div>
                                    <div className="col-6 text-start"><span className="fs-5 fw-bold">₹ {totalPrice}</span></div>
                                    <div className="col-6 text-end"><span className="fs-4 fw-bold text-primary">Final Price:</span></div>
                                    <div className="col-6 text-start"><span className="fs-4 fw-bold text-primary">₹ {finalPrice}</span></div>
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">Fee Status<span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        id="feeStatus"
                                        value={formData.feeStatus}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Partially Paid">Partially Paid</option>
                                        <option value="Fully Paid">Fully Paid</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Payment Mode<span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        name="paymentMode"
                                        value={formData.paymentMode}
                                        onChange={handleInputChange}
                                    >
                                        <option value="CASH">CASH</option>
                                        <option value="GPAY">GPAY</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            {formData.feeStatus === 'Partially Paid' && (
                                <div className="card border-primary-subtle bg-primary-light p-3 mb-4 fade-in">
                                    <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-calendar-event me-2"></i>Installment Terms (3 Terms)</h6>
                                    <div className="row g-3">
                                        {/* Term 1 */}
                                        <div className="col-md-4">
                                            <div className="p-2 border rounded bg-white">
                                                <label className="form-label small text-muted mb-1">Term 1 (Admission Time)</label>
                                                <div className="input-group input-group-sm mb-2">
                                                    <span className="input-group-text">₹</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder="Amount"
                                                        value={formData.installments.term1.amount}
                                                        onChange={(e) => handleInstallmentChange('term1', 'amount', e.target.value)}
                                                        min="1"
                                                    />
                                                </div>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    value={formData.installments.term1.date}
                                                    onChange={(e) => handleInstallmentChange('term1', 'date', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Term 2 */}
                                        <div className="col-md-4">
                                            <div className={`p-2 border rounded ${formData.installments.term1.amount > 0 && formData.installments.term1.date ? 'bg-white' : 'bg-light text-muted'}`}>
                                                <label className="form-label small text-muted mb-1">Term 2</label>
                                                <div className="input-group input-group-sm mb-2">
                                                    <span className="input-group-text">₹</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder="Amount"
                                                        value={formData.installments.term2.amount}
                                                        onChange={(e) => handleInstallmentChange('term2', 'amount', e.target.value)}
                                                        disabled={!(formData.installments.term1.amount > 0 && formData.installments.term1.date)}
                                                        min="1"
                                                    />
                                                </div>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    value={formData.installments.term2.date}
                                                    onChange={(e) => handleInstallmentChange('term2', 'date', e.target.value)}
                                                    disabled={!(formData.installments.term1.amount > 0 && formData.installments.term1.date)}
                                                />
                                                <div className="small text-muted mt-1" style={{ fontSize: '0.7rem' }}>Next Payment Date</div>
                                            </div>
                                        </div>

                                        {/* Term 3 */}
                                        <div className="col-md-4">
                                            <div className={`p-2 border rounded ${formData.installments.term2.amount > 0 && formData.installments.term2.date ? 'bg-white' : 'bg-light text-muted'}`}>
                                                <label className="form-label small text-muted mb-1">Term 3</label>
                                                <div className="input-group input-group-sm mb-2">
                                                    <span className="input-group-text">₹</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder="Amount"
                                                        value={formData.installments.term3.amount}
                                                        onChange={(e) => handleInstallmentChange('term3', 'amount', e.target.value)}
                                                        disabled={!(formData.installments.term2.amount > 0 && formData.installments.term2.date)}
                                                        min="1"
                                                    />
                                                </div>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    value={formData.installments.term3.date}
                                                    onChange={(e) => handleInstallmentChange('term3', 'date', e.target.value)}
                                                    disabled={!(formData.installments.term2.amount > 0 && formData.installments.term2.date)}
                                                />
                                                <div className="small text-muted mt-1" style={{ fontSize: '0.7rem' }}>Next Payment Date</div>
                                            </div>
                                        </div>
                                    </div>
                                    {(() => {
                                        const term1 = Number(formData.installments.term1.amount) || 0;
                                        const term2 = Number(formData.installments.term2.amount) || 0;
                                        const term3 = Number(formData.installments.term3.amount) || 0;
                                        const totalInstallment = term1 + term2 + term3;
                                        const diff = totalInstallment - finalPrice;
                                        const isMatch = Math.abs(diff) < 0.01;

                                        let message = '';
                                        let colorClass = '';

                                        if (totalInstallment < finalPrice) {
                                            message = "Total installment amount is less than the required target amount.";
                                            colorClass = "text-danger";
                                        } else if (totalInstallment > finalPrice) {
                                            message = "Total installment amount exceeds the target amount.";
                                            colorClass = "text-danger";
                                        } else {
                                            colorClass = "text-success";
                                        }

                                        return (
                                            <div className="mt-3 text-end">
                                                <div className={`fw-bold small mb-1 ${colorClass}`}>
                                                    Sum: ₹{totalInstallment} / Target: ₹{finalPrice}
                                                </div>
                                                {message && <div className="small text-danger fw-bold">{message}</div>}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            <div className="d-flex justify-content-between mt-4">
                                <button className="btn btn-outline-secondary" onClick={() => setActiveTab('about')}>Previous</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => isTabValid('course') && setActiveTab('education')}
                                    disabled={!isTabValid('course')}
                                >
                                    Next: Education
                                </button>
                            </div>

                            {/* Custom Fields for Course Tab */}
                            {customFields.some(f => f.tab_name === 'course' && f.is_active) && (
                                <div className="mt-4 border-top pt-4">
                                    <h6 className="text-muted mb-3">Additional Course Info</h6>
                                    <div className="row g-3">
                                        {renderCustomFields('course')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Education Tab */}
                    {activeTab === 'education' && (
                        <div className="fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Education Details</h5>
                                {isAdmin() && (
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                            setNewField({ ...newField, tab_name: 'education' });
                                            setShowAddFieldModal(true);
                                        }}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i> Add Field
                                    </button>
                                )}
                            </div>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Education Level<span className="text-danger">*</span></label>
                                    <select className="form-select" id="educationLevel" value={formData.educationLevel} onChange={handleInputChange}>
                                        <option value="">Choose...</option>
                                        <option value="UG">UG</option>
                                        <option value="PG">PG</option>
                                        <option value="Diploma">Diploma</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">College/School Name<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="collegeName" value={formData.collegeName} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Specialization/Branch<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="specialization" value={formData.specialization} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Year of Passing<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="yearOfPassing" value={formData.yearOfPassing} onChange={handleInputChange} placeholder="YYYY" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Marks / CGPA</label>
                                    <input type="text" className="form-control" id="marks" value={formData.marks} onChange={handleInputChange} />
                                </div>
                            </div>

                            {formData.experience === 'experienced' && (
                                <div className="mt-4">
                                    <h6 className="text-primary">Work Experience</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Profession</label>
                                            <input type="text" className="form-control" id="profession" value={formData.profession} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Years of Exp</label>
                                            <input type="number" className="form-control" id="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="d-flex justify-content-between mt-4">
                                <button className="btn btn-outline-secondary" onClick={() => setActiveTab('course')}>Previous</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => isTabValid('education') && setActiveTab('parent')}
                                    disabled={!isTabValid('education')}
                                >
                                    Next: Parent Details
                                </button>
                            </div>

                            {/* Custom Fields for Education Tab */}
                            {customFields.some(f => f.tab_name === 'education' && f.is_active) && (
                                <div className="mt-4 border-top pt-4">
                                    <h6 className="text-muted mb-3">Additional Academic Info</h6>
                                    <div className="row g-3">
                                        {renderCustomFields('education')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Parent Tab */}
                    {activeTab === 'parent' && (
                        <div className="fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Parent / Guardian Details</h5>
                                {isAdmin() && (
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                            setNewField({ ...newField, tab_name: 'parent' });
                                            setShowAddFieldModal(true);
                                        }}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i> Add Field
                                    </button>
                                )}
                            </div>

                            {/* Guardian 1 */}
                            <h6 className="text-primary mb-3">Guardian 1 (Primary)</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">Name<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="guardian1Name" value={formData.guardian1Name} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Relationship<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="guardian1Relation" value={formData.guardian1Relation} onChange={handleInputChange} placeholder="Father, Mother, etc." />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${formData.guardian1Phone && formData.guardian1Phone.length !== 10 ? 'is-invalid' : ''}`}
                                        id="guardian1Phone"
                                        value={formData.guardian1Phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {formData.guardian1Phone && formData.guardian1Phone.length !== 10 && (
                                        <div className="invalid-feedback">Must be exactly 10 digits.</div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Occupation</label>
                                    <input type="text" className="form-control" id="guardian1Occupation" value={formData.guardian1Occupation} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Guardian 2 */}
                            <h6 className="text-primary mb-3 pt-3 border-top">Guardian 2 (Optional)</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Name</label>
                                    <input type="text" className="form-control" id="guardian2Name" value={formData.guardian2Name} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Relationship</label>
                                    <input type="text" className="form-control" id="guardian2Relation" value={formData.guardian2Relation} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="text"
                                        className={`form-control ${formData.guardian2Phone && formData.guardian2Phone.length > 0 && formData.guardian2Phone.length !== 10 ? 'is-invalid' : ''}`}
                                        id="guardian2Phone"
                                        value={formData.guardian2Phone}
                                        onChange={handleInputChange}
                                    />
                                    {formData.guardian2Phone && formData.guardian2Phone.length > 0 && formData.guardian2Phone.length !== 10 && (
                                        <div className="invalid-feedback">Must be exactly 10 digits.</div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Occupation</label>
                                    <input type="text" className="form-control" id="guardian2Occupation" value={formData.guardian2Occupation} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="d-flex justify-content-between mt-4">
                                <button className="btn btn-outline-secondary" onClick={() => setActiveTab('education')}>Previous</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => isTabValid('parent') && setActiveTab('overall')}
                                    disabled={!isTabValid('parent')}
                                >
                                    Next: Review
                                </button>
                            </div>

                            {/* Custom Fields for Parent Tab */}
                            {customFields.some(f => f.tab_name === 'parent' && f.is_active) && (
                                <div className="mt-4 border-top pt-4">
                                    <h6 className="text-muted mb-3">Additional Family Info</h6>
                                    <div className="row g-3">
                                        {renderCustomFields('parent')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Overall Tab */}
                    {activeTab === 'overall' && (
                        <div className="fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Review Details</h5>
                                {isAdmin() && (
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                            setNewField({ ...newField, tab_name: 'overall' });
                                            setShowAddFieldModal(true);
                                        }}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i> Add Field
                                    </button>
                                )}
                            </div>
                            <div className="alert alert-info">Please review all details before submitting.</div>
                            <div className="mb-3">
                                <strong>Name:</strong> {formData.fullName} <br />
                                <strong>Course:</strong> {formData.courses.map(c => c.course).join(', ')} <br />
                                <strong>Fee:</strong> ₹ {finalPrice} <br />
                                <strong>Fee Status:</strong> {formData.feeStatus}
                                {formData.feeStatus === 'Partially Paid' && (
                                    <div className="mt-2 p-2 bg-light rounded small">
                                        <strong>Installments:</strong><br />
                                        Term 1: ₹{formData.installments.term1.amount} (Today)<br />
                                        Term 2: ₹{formData.installments.term2.amount} ({formData.installments.term2.date || 'Date not set'})<br />
                                        Term 3: ₹{formData.installments.term3.amount} ({formData.installments.term3.date || 'Date not set'})
                                    </div>
                                )}
                            </div>

                            {/* Review Custom Fields */}
                            {customFields.some(f => f.is_active && formData.custom_fields[f.field_name]) && (
                                <div className="mt-3 p-3 bg-light rounded shadow-sm">
                                    <h6 className="fw-bold mb-2">Additional Details</h6>
                                    <div className="row g-2">
                                        {customFields.filter(f => f.is_active && formData.custom_fields[f.field_name]).map(f => (
                                            <div className="col-md-6 small" key={f.id}>
                                                <strong>{f.field_label}:</strong> {
                                                    f.field_type === 'File Upload' && formData.custom_fields[f.field_name]
                                                        ? formData.custom_fields[f.field_name].name
                                                        : formData.custom_fields[f.field_name]?.toString() || 'N/A'
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="d-flex justify-content-between mt-4">
                                <button className="btn btn-outline-secondary" onClick={() => setActiveTab('parent')}>Previous</button>
                                <button className="btn btn-success" onClick={openConfirmModal}>Apply for Admission</button>
                            </div>

                            {/* Custom Fields for Overall Tab (Input Fields) */}
                            {customFields.some(f => f.tab_name === 'overall' && f.is_active) && (
                                <div className="mt-4 border-top pt-4">
                                    <h6 className="text-muted mb-3">Other Details</h6>
                                    <div className="row g-3">
                                        {renderCustomFields('overall')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Field Modal */}
            {
                showAddFieldModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add Custom Field to {newField.tab_name.toUpperCase()}</h5>
                                    <button className="btn-close" onClick={() => setShowAddFieldModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Field Label</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newField.field_label}
                                            onChange={(e) => setNewField({ ...newField, field_label: e.target.value })}
                                            placeholder="e.g. Caste"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Field Type</label>
                                        <select
                                            className="form-select"
                                            value={newField.field_type}
                                            onChange={(e) => setNewField({ ...newField, field_type: e.target.value })}
                                        >
                                            <option value="Text">Text</option>
                                            <option value="Number">Number</option>
                                            <option value="Date">Date</option>
                                            <option value="Dropdown">Dropdown</option>
                                            <option value="Checkbox">Checkbox</option>
                                            <option value="File Upload">File Upload</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Placeholder</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newField.placeholder}
                                            onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                                        />
                                    </div>
                                    {newField.field_type === 'Dropdown' && (
                                        <div className="mb-3">
                                            <label className="form-label">Dropdown Options (Comma separated)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newField.options}
                                                onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                                                placeholder="Option 1, Option 2, Option 3"
                                            />
                                        </div>
                                    )}
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={newField.required}
                                            onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                                        />
                                        <label className="form-check-label">Required Field</label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowAddFieldModal(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleAddField}>Save Field</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Confirmation Modal */}
            {
                showConfirmModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-success text-white">
                                    <h5 className="modal-title">Review & Confirm Admission</h5>
                                    <button className="btn-close btn-close-white" onClick={handleCancelConfirm}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="text-center mb-3">
                                        <div className="display-4 text-warning fw-bold">{countdown > 0 ? countdown : <i className="bi bi-check-circle text-success"></i>}</div>
                                        {countdown > 0 && <small className="text-muted">Please review all details before confirming...</small>}
                                    </div>

                                    {/* Student Details Summary */}
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <h6 className="fw-bold text-primary mb-2"><i className="bi bi-person-fill me-2"></i>Personal Information</h6>
                                            <div className="small">
                                                <div><strong>Name:</strong> {formData.fullName}</div>
                                                <div><strong>Email:</strong> {formData.email || 'N/A'}</div>
                                                <div><strong>Phone:</strong> {formData.phone}</div>
                                                <div><strong>DOB:</strong> {formData.dob || 'N/A'}</div>
                                                <div><strong>Address:</strong> {formData.address || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <h6 className="fw-bold text-primary mb-2"><i className="bi bi-book-fill me-2"></i>Academic Details</h6>
                                            <div className="small">
                                                <div><strong>Education:</strong> {formData.educationLevel || 'N/A'}</div>
                                                <div><strong>College:</strong> {formData.collegeName || 'N/A'}</div>
                                                <div><strong>Specialization:</strong> {formData.specialization || 'N/A'}</div>
                                                <div><strong>Year of Passing:</strong> {formData.yearOfPassing || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <h6 className="fw-bold text-primary mb-2"><i className="bi bi-people-fill me-2"></i>Guardian Information</h6>
                                            <div className="small">
                                                <div><strong>Guardian 1:</strong> {formData.guardian1Name || 'N/A'} ({formData.guardian1Relation || 'N/A'})</div>
                                                <div><strong>Phone:</strong> {formData.guardian1Phone || 'N/A'}</div>
                                                <div><strong>Guardian 2:</strong> {formData.guardian2Name || 'N/A'} ({formData.guardian2Relation || 'N/A'})</div>
                                                <div><strong>Phone:</strong> {formData.guardian2Phone || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <h6 className="fw-bold text-primary mb-2"><i className="bi bi-mortarboard-fill me-2"></i>Course & Fee Details</h6>
                                            <div className="small">
                                                <div><strong>Courses:</strong> {formData.courses.map(c => c.course).join(', ')}</div>
                                                <div><strong>Total Fee:</strong> ₹{totalPrice.toLocaleString()}</div>
                                                <div><strong>Final Fee:</strong> ₹{finalPrice.toLocaleString()}</div>
                                                <div><strong>Fee Status:</strong> {formData.feeStatus}</div>
                                                {formData.feeStatus === 'Partially Paid' && (
                                                    <div className="mt-2 p-2 border rounded bg-light-subtle">
                                                        <div className="fw-bold mb-1">Payment Schedule:</div>
                                                        <div>1st Term: ₹{formData.installments.term1.amount} (Paid)</div>
                                                        <div>2nd Term: ₹{formData.installments.term2.amount} (Due: {formData.installments.term2.date || 'N/A'})</div>
                                                        <div>3rd Term: ₹{formData.installments.term3.amount} (Due: {formData.installments.term3.date || 'N/A'})</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Fields Summary */}
                                    {customFields.some(f => f.is_active && formData.custom_fields[f.field_name]) && (
                                        <div className="col-12 mt-3">
                                            <h6 className="fw-bold text-primary mb-2"><i className="bi bi-plus-circle-fill me-2"></i>Additional Information</h6>
                                            <div className="p-2 border rounded bg-light-subtle">
                                                <div className="row g-2">
                                                    {customFields.filter(f => f.is_active && formData.custom_fields[f.field_name]).map(f => (
                                                        <div className="col-md-6 small" key={f.id}>
                                                            <strong>{f.field_label}:</strong> {
                                                                f.field_type === 'File Upload' && formData.custom_fields[f.field_name]
                                                                    ? formData.custom_fields[f.field_name].name
                                                                    : formData.custom_fields[f.field_name]?.toString() || 'N/A'
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={handleCancelConfirm}>
                                        <i className="bi bi-x-circle me-2"></i>Cancel
                                    </button>
                                    <button className="btn btn-success" disabled={!isConfirmEnabled} onClick={handleFinalSubmit}>
                                        <i className="bi bi-check-circle me-2"></i>Confirm Admission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Admission;
