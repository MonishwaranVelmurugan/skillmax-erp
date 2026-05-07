import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';

const StudentOverview = () => {
    const { rollNo } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    // Form state for editing
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        education: '',
        college: '',
        specialization: '',
        year_passing: '',
        guardian_name: '',
        guardian_phone: '',
        course: '',
        batch: '',
        assigned_staff: '',
        total_fee: 0,
        discount: 0,
        paid_amount: 0,
        id_proof_type: '',
        custom_fields: {}
    });

    const [customFiles, setCustomFiles] = useState({});

    const [photoFile, setPhotoFile] = useState(null);
    const [idProofFile, setIdProofFile] = useState(null);

    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN';

    const fetchStudent = async () => {
        setLoading(true);
        try {
            const data = await studentService.getStudentByRollNo(rollNo);
            if (data) {
                setStudent(data);
                // Pre-fill form data
                setFormData({
                    name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    education: data.education_level || '',
                    college: data.college_name || '',
                    specialization: data.specialization || '',
                    year_passing: data.year_of_passing || '',
                    guardian_name: data.guardian1_name || '',
                    guardian_phone: data.guardian1_phone || '',
                    course: data.courses && data.courses.length > 0 ? data.courses[0].course : '',
                    batch: data.batch || '',
                    assigned_staff: data.assigned_to || '',
                    total_fee: data.total_fee || 0,
                    discount: data.discount || 0,
                    paid_amount: data.paid_amount || 0,
                    id_proof_type: data.id_proof_type || '',
                    custom_fields: data.custom_fields ? data.custom_fields.reduce((acc, f) => ({ ...acc, [f.field_name]: f.value }), {}) : {}
                });
            } else {
                setError('Student not found');
            }
        } catch (err) {
            console.error('Error fetching student:', err);
            setError('Failed to load student details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (rollNo) {
            fetchStudent();
        }
    }, [rollNo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'student_photo') setPhotoFile(files[0]);
        if (name === 'id_proof') setIdProofFile(files[0]);
    };

    const handleCustomFieldChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            custom_fields: { ...prev.custom_fields, [name]: value }
        }));
    };

    const handleCustomFileChange = (e, name) => {
        setCustomFiles(prev => ({ ...prev, [name]: e.target.files[0] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const uploadData = new FormData();
            // Append all text fields
            Object.keys(formData).forEach(key => {
                uploadData.append(key, formData[key]);
            });
            // Append files if selected
            if (photoFile) uploadData.append('student_photo', photoFile);
            if (idProofFile) uploadData.append('id_proof', idProofFile);

            // Append custom fields
            uploadData.append('custom_fields', JSON.stringify(formData.custom_fields));

            // Append custom files
            Object.keys(customFiles).forEach(name => {
                uploadData.append(`custom_file_${name}`, customFiles[name]);
            });

            const response = await studentService.updateStudentByRollNo(rollNo, uploadData);
            if (response.status === 'success') {
                alert('Student details updated successfully');
                setIsEditing(false);
                setPhotoFile(null);
                setIdProofFile(null);
                setCustomFiles({});
                await fetchStudent(); // Refresh data
            }
        } catch (err) {
            console.error('Save failed:', err);
            alert(err.response?.data?.error || 'Failed to update student details');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div><p className="mt-2">Loading student details...</p></div>;
    if (error) return <div className="p-5 text-center text-danger"><h3>Error</h3><p>{error}</p><button className="btn btn-primary mt-3" onClick={() => navigate('/students')}>Back to List</button></div>;
    if (!student) return <div className="p-5 text-center text-muted">No student data found.</div>;

    // Local calculations for real-time progress in edit mode
    const effective_fee = Number(formData.total_fee) - Number(formData.discount);
    const pending_balance = effective_fee - Number(formData.paid_amount);
    const progress = effective_fee > 0 ? Math.round((Number(formData.paid_amount) / effective_fee) * 100) : 0;

    const handleApplyCertificate = async () => {
        if (!student || !student.id) return;
        setIsApplying(true);
        try {
            await studentService.updateStudent(student.id, {
                certificate_applied: true,
                certificate_status: 'Applied'
            });
            alert('Certificate successfully applied.');
            await fetchStudent();
        } catch (error) {
            console.error('Failed to apply for certificate:', error);
            alert('Failed to apply for certificate. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    Student Overview: <span className="text-primary">{student.full_name}</span>
                </h4>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/students')}>
                        <i className="bi bi-arrow-left me-2"></i>Back to Students
                    </button>
                    {isAdmin && !isEditing && (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            <i className="bi bi-pencil-square me-2"></i>Edit Student
                        </button>
                    )}
                    {isEditing && (
                        <>
                            <button className="btn btn-success" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg me-2"></i>}
                                Save Changes
                            </button>
                            <button className="btn btn-danger" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                <i className="bi bi-x-lg me-2"></i>Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="row g-4">
                {/* Profile Summary Card */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100 overflow-hidden">
                        <div className="profile-header" style={{ height: '120px', background: 'linear-gradient(90deg, #1e73ff, #2563eb)' }}></div>
                        <div className="profile-image-wrapper d-flex justify-content-center position-relative" style={{ marginTop: '-60px', zIndex: '1' }}>
                            {isEditing ? (
                                <div className="position-relative">
                                    <div className="rounded-circle border border-5 border-white shadow-lg bg-white d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '120px', height: '120px' }}>
                                        {photoFile ? (
                                            <img src={URL.createObjectURL(photoFile)} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="Preview" />
                                        ) : student.student_photo ? (
                                            <img src={`http://localhost:8000${student.student_photo}`} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={student.full_name} />
                                        ) : (
                                            <i className="bi bi-person-fill text-primary" style={{ fontSize: '4rem' }}></i>
                                        )}
                                    </div>
                                    <label className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow p-2" style={{ cursor: 'pointer', transform: 'translate(10%, 10%)' }}>
                                        <i className="bi bi-camera-fill text-primary"></i>
                                        <input type="file" className="d-none" name="student_photo" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                            ) : (
                                student.student_photo ? (
                                    <img
                                        src={`http://localhost:8000${student.student_photo}`}
                                        className="rounded-circle border border-5 border-white shadow-lg"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        alt={student.full_name}
                                    />
                                ) : (
                                    <div className="rounded-circle border border-5 border-white shadow-lg bg-white d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                                        <i className="bi bi-person-fill text-primary" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                )
                            )}
                        </div>
                        <div className="card-body pt-5 text-center mt-4">
                            {isEditing ? (
                                <div className="mb-3 px-3">
                                    <label className="form-label small text-muted">Full Name</label>
                                    <input type="text" className="form-control text-center fw-bold" name="name" value={formData.name} onChange={handleChange} />
                                </div>
                            ) : (
                                <h5 className="fw-bold mb-1">{student.full_name}</h5>
                            )}

                            <p className="text-muted small mb-3">{student.student_id} | {isEditing ? <input type="text" className="form-control d-inline-block w-auto form-control-sm" name="batch" value={formData.batch} onChange={handleChange} /> : (student.batch || 'General')}</p>

                            <div className="d-flex justify-content-center gap-2 mb-4">
                                <span className={`badge ${student.fee_status === 'Fully Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {student.fee_status}
                                </span>
                                <span className="badge bg-info">{student.admission_date}</span>
                            </div>

                            <div className="border-top pt-3 text-start">
                                <div className="mb-3">
                                    <small className="text-muted d-block">Phone</small>
                                    {isEditing ? (
                                        <input type="text" className="form-control form-control-sm font-monospace" name="phone" value={formData.phone} onChange={handleChange} />
                                    ) : (
                                        <span className="fw-medium">{student.phone}</span>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted d-block">Email</small>
                                    {isEditing ? (
                                        <input type="email" className="form-control form-control-sm" name="email" value={formData.email} onChange={handleChange} />
                                    ) : (
                                        <span className="fw-medium">{student.email || 'N/A'}</span>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted d-block">Address</small>
                                    {isEditing ? (
                                        <textarea className="form-control form-control-sm" name="address" rows="2" value={formData.address} onChange={handleChange}></textarea>
                                    ) : (
                                        <span className="fw-medium small">{student.address || 'N/A'}</span>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="mb-0 pt-2 border-top">
                                        <small className="text-muted d-block mb-1">ID Proof ({formData.id_proof_type || 'None'})</small>
                                        <div className="d-flex flex-column gap-2">
                                            <select className="form-select form-select-sm" name="id_proof_type" value={formData.id_proof_type} onChange={handleChange}>
                                                <option value="">Select ID Type</option>
                                                <option value="Aadhar">Aadhar</option>
                                                <option value="Driving License">Driving License</option>
                                                <option value="Passport">Passport</option>
                                                <option value="Voter ID">Voter ID</option>
                                            </select>
                                            <input type="file" className="form-control form-control-sm" name="id_proof" accept="image/*,application/pdf" onChange={handleFileChange} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Information */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold mb-0 text-primary"><i className="bi bi-book me-2"></i>Academic Details</h6>
                        </div>
                        <div className="card-body pt-0">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">Enrolled Course(s)</small>
                                        {isEditing ? (
                                            <input type="text" className="form-control form-control-sm fw-bold" name="course" value={formData.course} onChange={handleChange} />
                                        ) : (
                                            <div className="fw-bold">{student.courses && student.courses.length > 0 ? student.courses.map(c => c.course).join(', ') : 'N/A'}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">Batch</small>
                                        {isEditing ? (
                                            <input type="text" className="form-control form-control-sm fw-bold" name="batch" value={formData.batch} onChange={handleChange} />
                                        ) : (
                                            <div className="fw-bold">{student.batch || 'N/A'}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">Assigned Staff</small>
                                        {isEditing ? (
                                            <input type="text" className="form-control form-control-sm fw-bold text-uppercase" name="assigned_staff" value={formData.assigned_staff} onChange={handleChange} />
                                        ) : (
                                            <div className="fw-bold text-uppercase">{student.assigned_to}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">Educational Background</small>
                                        {isEditing ? (
                                            <div className="d-flex flex-column gap-2">
                                                <div className="d-flex gap-2">
                                                    <input type="text" className="form-control form-control-sm" placeholder="Edu Level" name="education" value={formData.education} onChange={handleChange} />
                                                    <input type="text" className="form-control form-control-sm" placeholder="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
                                                </div>
                                                <input type="text" className="form-control form-control-sm" placeholder="College Name" name="college" value={formData.college} onChange={handleChange} />
                                                <input type="text" className="form-control form-control-sm" placeholder="Year" name="year_passing" value={formData.year_passing} onChange={handleChange} />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="fw-bold">{student.education_level} - {student.college_name}</div>
                                                <small>{student.specialization} ({student.year_of_passing})</small>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded h-100">
                                        <small className="text-muted d-block mb-1">Guardian Info</small>
                                        {isEditing ? (
                                            <div className="d-flex flex-column gap-2">
                                                <input type="text" className="form-control form-control-sm font-bold" placeholder="Guardian Name" name="guardian_name" value={formData.guardian_name} onChange={handleChange} />
                                                <input type="text" className="form-control form-control-sm" placeholder="Guardian Phone" name="guardian_phone" value={formData.guardian_phone} onChange={handleChange} />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="fw-bold">{student.guardian1_name}</div>
                                                <small className="text-muted">{student.guardian1_phone}</small>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {student.custom_fields && student.custom_fields.length > 0 && (
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white py-3 border-0">
                                <h6 className="fw-bold mb-0 text-info"><i className="bi bi-info-circle me-2"></i>Additional Information</h6>
                            </div>
                            <div className="card-body pt-0">
                                <div className="row g-3">
                                    {student.custom_fields.map((field, index) => (
                                        <div className="col-md-6" key={field.field_name || index}>
                                            <div className="p-3 bg-light rounded h-100">
                                                <small className="text-muted d-block mb-1">{field.field_label}</small>
                                                {isEditing ? (
                                                    <div className="mt-1">
                                                        {(() => {
                                                            const fType = field.field_type?.toLowerCase();
                                                            if (fType === 'dropdown') {
                                                                return (
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={formData.custom_fields[field.field_name] || ''}
                                                                        onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
                                                                    >
                                                                        <option value="">Select...</option>
                                                                        {field.options && Array.isArray(field.options) && field.options.map(opt => (
                                                                            <option key={opt} value={opt}>{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                );
                                                            } else if (fType === 'checkbox') {
                                                                return (
                                                                    <div className="form-check">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            checked={formData.custom_fields[field.field_name] === 'true' || formData.custom_fields[field.field_name] === true}
                                                                            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.checked)}
                                                                        />
                                                                        <label className="form-check-label small">Yes</label>
                                                                    </div>
                                                                );
                                                            } else if (fType === 'date') {
                                                                return (
                                                                    <input
                                                                        type="date"
                                                                        className="form-control form-control-sm"
                                                                        value={formData.custom_fields[field.field_name] || ''}
                                                                        onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
                                                                    />
                                                                );
                                                            } else if (fType === 'number') {
                                                                return (
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm"
                                                                        value={formData.custom_fields[field.field_name] || ''}
                                                                        onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
                                                                    />
                                                                );
                                                            } else if (fType === 'file upload' || fType === 'file') {
                                                                return (
                                                                    <div className="d-flex flex-column gap-1">
                                                                        {formData.custom_fields[field.field_name] && typeof formData.custom_fields[field.field_name] === 'string' && (
                                                                            <small className="text-truncate d-block">Current: {formData.custom_fields[field.field_name].split('/').pop()}</small>
                                                                        )}
                                                                        <input
                                                                            type="file"
                                                                            className="form-control form-control-sm"
                                                                            onChange={(e) => handleCustomFileChange(e, field.field_name)}
                                                                        />
                                                                    </div>
                                                                );
                                                            } else {
                                                                return (
                                                                    <input
                                                                        type="text"
                                                                        className="form-control form-control-sm"
                                                                        value={formData.custom_fields[field.field_name] || ''}
                                                                        onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
                                                                    />
                                                                );
                                                            }
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <div className="fw-bold">
                                                        {field.field_type === 'File Upload' && field.value ? (
                                                            <a href={`http://localhost:8000/media/${field.value}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary py-0 px-2" style={{ fontSize: '0.75rem' }}>
                                                                <i className="bi bi-file-earmark-arrow-down me-1"></i>View Attachment
                                                            </a>
                                                        ) : field.field_type === 'Checkbox' ? (
                                                            field.value === 'true' || field.value === true ? 'Yes' : 'No'
                                                        ) : field.value || 'N/A'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold mb-0 text-success"><i className="bi bi-cash-stack me-2"></i>Fee & Payment Summary</h6>
                        </div>
                        <div className="card-body pt-0">
                            <div className="row g-3">
                                <div className="col-md-6 col-xl-3">
                                    <div className="p-3 border rounded text-center h-100">
                                        <div className="text-muted small mb-1">Total Fee</div>
                                        {isEditing ? (
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text px-1">₹</span>
                                                <input type="number" className="form-control fw-bold text-center" name="total_fee" value={formData.total_fee} onChange={handleChange} />
                                            </div>
                                        ) : (
                                            <div className="h5 fw-bold mb-0">₹{Number(student.total_fee).toLocaleString()}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6 col-xl-3">
                                    <div className="p-3 border rounded text-center h-100">
                                        <div className="text-muted small mb-1">Discount</div>
                                        {isEditing ? (
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text px-1">₹</span>
                                                <input type="number" className="form-control fw-bold text-center text-primary" name="discount" value={formData.discount} onChange={handleChange} />
                                            </div>
                                        ) : (
                                            <div className="h5 fw-bold mb-0 text-primary">₹{Number(student.discount || 0).toLocaleString()}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6 col-xl-3">
                                    <div className="p-3 border rounded text-center bg-success bg-opacity-10 border-success h-100">
                                        <div className="text-success small mb-1">Paid Amount</div>
                                        {isEditing ? (
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text px-1">₹</span>
                                                <input type="number" className="form-control fw-bold text-center text-success" name="paid_amount" value={formData.paid_amount} onChange={handleChange} />
                                            </div>
                                        ) : (
                                            <div className="h5 fw-bold mb-0 text-success">₹{Number(student.paid_amount || 0).toLocaleString()}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6 col-xl-3">
                                    <div className="p-3 border rounded text-center bg-danger bg-opacity-10 border-danger h-100">
                                        <div className="text-danger small mb-1">Pending</div>
                                        <div className="h5 fw-bold mb-0 text-danger">₹{Number(isEditing ? pending_balance : student.pending_amount || 0).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-light rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small fw-bold">Payment Progress</span>
                                    <span className="small fw-bold">{isEditing ? progress : Math.round(((student.paid_amount || 0) / (student.final_fee || 1)) * 100)}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        style={{ width: `${isEditing ? progress : ((student.paid_amount || 0) / (student.final_fee || 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 text-center">
                                    <small className="text-muted">Effective Course Fee: <span className="fw-bold">₹{Number(isEditing ? effective_fee : student.final_fee).toLocaleString()}</span></small>
                                </div>
                            </div>

                            {/* Certificate Section */}
                            <div className="mt-4 p-3 bg-light rounded text-center">
                                <h6 className="fw-bold text-primary mb-3"><i className="bi bi-award me-2"></i>Certificate Status</h6>
                                {!isEditing && Number(student.pending_amount || 0) === 0 && !student.certificate_applied && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleApplyCertificate}
                                        disabled={isApplying}
                                    >
                                        {isApplying ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Applying...</>
                                        ) : (
                                            <><i className="bi bi-send-fill me-2"></i>Apply for Certificate</>
                                        )}
                                    </button>
                                )}
                                {student.certificate_applied && (
                                    <span className="badge bg-success p-2 fs-6">
                                        <i className="bi bi-check-circle-fill me-2"></i>Certificate Applied
                                    </span>
                                )}
                                {Number(student.pending_amount || 0) > 0 && !student.certificate_applied && (
                                    <p className="text-muted small mb-0">Clear your pending balance to apply for a certificate.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentOverview;
