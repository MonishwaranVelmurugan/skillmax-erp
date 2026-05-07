import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import studentService from '../services/studentService';

const AdmissionFormBuilder = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newField, setNewField] = useState({
        field_label: '',
        field_name: '',
        field_type: 'Text',
        placeholder: '',
        required: false,
        options: '',
        tab_name: 'about'
    });

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        setLoading(true);
        try {
            // Fetch all fields for the builder including inactive ones
            const data = await studentService.getCustomFields({ all: true });
            setFields(data);
        } catch (error) {
            console.error("Error fetching fields:", error);
        }
        setLoading(false);
    };

    const handleSaveField = async () => {
        if (!newField.field_label) {
            alert("Label is required");
            return;
        }
        try {
            const optionsArray = newField.options
                ? newField.options.split(",").map(o => o.trim()).filter(o => o !== "")
                : [];

            const payload = {
                ...newField,
                field_name: newField.field_name || newField.field_label.toLowerCase().replace(/\s+/g, '_'),
                field_type: newField.field_type.toLowerCase(),
                options: optionsArray,
                order: fields.length
            };

            await studentService.addCustomField(payload);
            fetchFields();
            setShowModal(false);
            setNewField({
                field_label: '',
                field_name: '',
                field_type: 'Text',
                placeholder: '',
                required: false,
                options: '',
                tab_name: 'about'
            });
        } catch (error) {
            console.error(error.response);
            alert(error.response?.data?.message || "Failed to add custom field");
        }
    };

    const handleDeleteField = async (id) => {
        if (!window.confirm("Are you sure you want to delete this field?")) return;
        try {
            await studentService.deleteCustomField(id);
            fetchFields();
        } catch (error) {
            alert("Failed to delete field");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            console.log("Toggling field:", id);
            const res = await axios.patch(
                `http://localhost:8000/api/custom-fields/toggle/${id}/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            // Update UI immediately
            setFields(prev =>
                prev.map(f =>
                    f.id === id ? { ...f, is_active: res.data.is_active } : f
                )
            );
        } catch (err) {
            console.error("Toggle error:", err.response || err);
        }
    };

    const handleToggleRequired = async (id) => {
        try {
            console.log("Toggling required status:", id);
            const res = await axios.patch(
                `http://localhost:8000/api/custom-fields/toggle-required/${id}/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            // Update UI immediately
            setFields(prev =>
                prev.map(f =>
                    f.id === id ? { ...f, required: res.data.required } : f
                )
            );
        } catch (err) {
            console.error("Toggle required error:", err.response || err);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local order
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setFields(updatedItems);

        // API Call
        try {
            const payload = updatedItems.map(item => ({ id: item.id, order: item.order }));
            await studentService.updateFieldOrder(payload);
        } catch (error) {
            console.error(error);
            alert("Failed to update field order");
            fetchFields(); // Reset if failed
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Dynamic Form Builder</h2>
                    <p className="text-muted">Manage additional fields for your admission form.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i>Add New Field
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4" style={{ width: "50px" }}>Drag</th>
                                    <th>Label</th>
                                    <th>Type</th>
                                    <th>Tab</th>
                                    <th>Required</th>
                                    <th>Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="custom-fields">
                                    {(provided) => (
                                        <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                            {loading ? (
                                                <tr><td colSpan="7" className="text-center py-5">Loading fields...</td></tr>
                                            ) : fields.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center py-5 text-muted">No custom fields added yet.</td></tr>
                                            ) : (
                                                (fields || []).map((field, index) => (
                                                    <Draggable key={String(field.id)} draggableId={String(field.id)} index={index}>
                                                        {(provided) => (
                                                            <tr
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                style={{ ...provided.draggableProps.style, backgroundColor: 'white' }}
                                                            >
                                                                <td className="ps-4" {...provided.dragHandleProps}>
                                                                    <i className="bi bi-grip-vertical text-muted fs-5" style={{ cursor: 'grab' }}></i>
                                                                </td>
                                                                <td>
                                                                    <div className="fw-bold">{field.field_label}</div>
                                                                    <small className="text-muted">{field.field_name}</small>
                                                                </td>
                                                                <td><span className="badge bg-info-subtle text-info">{field.field_type}</span></td>
                                                                <td>{field.tab_name.toUpperCase()}</td>
                                                                <td>
                                                                    <div className="form-check form-switch d-flex justify-content-start align-items-center p-0 m-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-check-input ms-0 me-2"
                                                                            style={{ cursor: 'pointer' }}
                                                                            checked={field.required || false}
                                                                            onChange={() => handleToggleRequired(field.id)}
                                                                        />
                                                                        <span className={field.required ? "text-danger" : "text-muted"}>
                                                                            {field.required ? "Required" : "Optional"}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="form-check form-switch d-flex justify-content-start align-items-center p-0 m-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-check-input ms-0 me-2"
                                                                            style={{ cursor: 'pointer' }}
                                                                            checked={field.is_active || false}
                                                                            onChange={() => handleToggleStatus(field.id)}
                                                                        />
                                                                        <span className={field.is_active ? "text-success fw-bold" : "text-muted"}>
                                                                            {field.is_active ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-end pe-4">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDeleteField(field.id)}
                                                                        title="Delete Field"
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </tbody>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Custom Field</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Field Label</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newField.field_label || ""}
                                        onChange={e => setNewField({ ...newField, field_label: e.target.value })}
                                        placeholder="e.g. Reference Number"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Tab Location</label>
                                    <select
                                        className="form-select"
                                        value={newField.tab_name || "about"}
                                        onChange={e => setNewField({ ...newField, tab_name: e.target.value })}
                                    >
                                        <option value="about">About (Personal)</option>
                                        <option value="course">Course</option>
                                        <option value="education">Education</option>
                                        <option value="parent">Parent</option>
                                        <option value="overall">Overall (Review)</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Field Type</label>
                                    <select
                                        className="form-select"
                                        value={newField.field_type || "Text"}
                                        onChange={e => setNewField({ ...newField, field_type: e.target.value })}
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
                                        value={newField.placeholder || ""}
                                        onChange={e => setNewField({ ...newField, placeholder: e.target.value })}
                                    />
                                </div>
                                {newField.field_type === 'Dropdown' && (
                                    <div className="mb-3">
                                        <label className="form-label">Options (Comma separated)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newField.options || ""}
                                            onChange={e => setNewField({ ...newField, options: e.target.value })}
                                            placeholder="Yes, No, Maybe"
                                        />
                                    </div>
                                )}
                                <div className="form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="requiredCheck"
                                        checked={newField.required || false}
                                        onChange={e => setNewField({ ...newField, required: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="requiredCheck">Mark as Required</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSaveField}>Save Field</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdmissionFormBuilder;
