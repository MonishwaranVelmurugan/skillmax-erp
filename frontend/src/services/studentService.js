import api from './api';
import storageService from './storageService';

const studentService = {
    getAllStudents: async (searchQuery = '', signal = null) => {
        try {
            console.log(`[studentService] Fetching students (search: "${searchQuery}")...`);
            const url = searchQuery ? `/students/?search=${encodeURIComponent(searchQuery)}` : '/students/';
            const response = await api.get(url, { signal });
            console.log('[studentService] Response data:', response.data);
            return response.data;
        } catch (error) {
            console.error('[studentService] Error fetching students:', error);
            return [];
        }
    },

    getStudentsByMonth: async () => {
        try {
            console.log('[studentService] Fetching all students for month-wise view...');
            const response = await api.get('/students-by-month/');
            return response.data;
        } catch (error) {
            console.error('[studentService] Error fetching students by month:', error);
            return [];
        }
    },

    getCustomFields: async (options = {}) => {
        try {
            const query = options.all ? '?all=true' : '';
            const response = await api.get(`/admission/custom-fields/${query}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching custom fields:', error);
            return [];
        }
    },

    addCustomField: async (fieldData) => {
        try {
            const response = await api.post('/admission/custom-fields/add/', fieldData);
            return response.data;
        } catch (error) {
            console.error('Error adding custom field:', error);
            throw error;
        }
    },

    toggleFieldStatus: async (id) => {
        try {
            const response = await api.patch(`/admission/custom-fields/${id}/toggle-status/`);
            return response.data;
        } catch (error) {
            console.error('Error toggling custom field status:', error);
            throw error;
        }
    },

    toggleFieldRequired: async (id) => {
        try {
            const response = await api.patch(`/admission/custom-fields/${id}/toggle-required/`);
            return response.data;
        } catch (error) {
            console.error('Error toggling custom field required:', error);
            throw error;
        }
    },

    updateFieldOrder: async (items) => {
        try {
            const response = await api.post(`/admission/custom-fields/update-order/`, items);
            return response.data;
        } catch (error) {
            console.error('Error updating custom field order:', error);
            throw error;
        }
    },

    deleteCustomField: async (id) => {
        try {
            const response = await api.delete(`/admission-custom-fields/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error deleting custom field:', error);
            throw error;
        }
    },


    createStudent: async (studentData) => {
        try {
            const isFormData = studentData instanceof FormData;
            const token = localStorage.getItem('token');
            const tenantDb = localStorage.getItem('tenant_db');

            const headers = { 'Authorization': `Bearer ${token}` };
            if (tenantDb) headers['x-database'] = tenantDb;
            if (!isFormData) headers['Content-Type'] = 'application/json';

            // Use the centralized save/ endpoint which supports custom fields
            const response = await fetch("http://127.0.0.1:8000/api/admission/save/", {
                method: 'POST',
                headers,
                body: isFormData ? studentData : JSON.stringify(studentData)
            });
            return response;
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    },

    searchStudents: async (query, signal = null) => {
        try {
            const students = await studentService.getAllStudents('', signal);
            const lowerQuery = query.toLowerCase();
            return students.filter(s =>
                s.full_name?.toLowerCase().includes(lowerQuery) ||
                s.student_id?.toLowerCase() === lowerQuery ||
                s.phone?.includes(query)
            );
        } catch (error) {
            console.error('Error searching students:', error);
            return [];
        }
    },

    getStudentById: async (id) => {
        try {
            const response = await api.get(`/students/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student:', error);
            return null;
        }
    },

    getStudentByRollNo: async (rollNo) => {
        try {
            const response = await api.get(`/students/roll/${rollNo}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student by roll no:', error);
            return null;
        }
    },

    updateStudent: async (id, data) => {
        try {
            const isFormData = data instanceof FormData;
            const response = await api.patch(`/students/${id}/`, data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    },

    updateStudentByRollNo: async (rollNo, data) => {
        try {
            const isFormData = data instanceof FormData;
            const response = await api.put(`/students/${rollNo}/update/`, data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        } catch (error) {
            console.error('Error updating student by roll no:', error);
            throw error;
        }
    },

    getPendingStudents: async () => {
        try {
            const response = await api.get('/students/pending/');
            return response.data;
        } catch (error) {
            console.error('Error fetching pending students:', error);
            return [];
        }
    },

    deleteStudentByRollNo: async (rollNo) => {
        try {
            const response = await api.delete(`/students/${rollNo}/delete/`);
            return response.data;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    },

    deleteStudent: async (id) => {
        try {
            const response = await api.delete(`/students/${id}/`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    },

    getHistory: async (id, limit = 50, offset = 0) => {
        try {
            const response = await api.get(`/students/${id}/history/?limit=${limit}&offset=${offset}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student history:', error);
            throw error;
        }
    },

    undoChange: async (studentId, historyId) => {
        try {
            const response = await api.post(`/students/${studentId}/undo/`, { history_id: historyId });
            return response.data;
        } catch (error) {
            console.error('Error undoing change:', error);
            throw error;
        }
    },

    uploadPhoto: async (studentId, photoFile) => {
        try {
            const formData = new FormData();
            formData.append('photo', photoFile);
            const response = await api.post(`/students/${studentId}/upload-photo/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    },

    uploadIdProof: async (studentId, idFile, idType) => {
        try {
            const formData = new FormData();
            formData.append('id_proof', idFile);
            formData.append('id_proof_type', idType);
            const response = await api.post(`/students/${studentId}/upload-id/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading ID proof:', error);
            throw error;
        }
    },
    updateCustomFieldValue: async (id, value) => {
        try {
            const response = await api.patch(`/custom-field-value/${id}/update/`, { value });
            return response.data;
        } catch (error) {
            console.error('Error updating custom field value:', error);
            throw error;
        }
    }
};

export default studentService;
