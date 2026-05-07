import api from './api';

const leadService = {
    getAllLeads: async () => {
        try {
            const response = await api.get('/leads/');
            return response.data;
        } catch (error) {
            console.error('[leadService] Error fetching leads:', error);
            throw error;
        }
    },

    getLeadById: async (id) => {
        try {
            const response = await api.get(`/leads/${id}/`);
            return response.data;
        } catch (error) {
            console.error('[leadService] Error fetching lead:', error);
            throw error;
        }
    },

    createLead: async (leadData) => {
        try {
            const response = await api.post('/leads/', leadData);
            return response.data;
        } catch (error) {
            console.error('[leadService] Error creating lead:', error);
            throw error;
        }
    },

    updateLead: async (id, leadData) => {
        try {
            const response = await api.patch(`/leads/${id}/`, leadData);
            return response.data;
        } catch (error) {
            console.error('[leadService] Error updating lead:', error);
            throw error;
        }
    },

    updateLeadStatus: async (leadId, status) => {
        try {
            console.log(`[leadService] Updating lead ${leadId} status to ${status}`);
            const response = await api.patch(`/leads/${leadId}/`, { status });
            console.log('[leadService] Lead status updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[leadService] Error updating lead status:', error);
            throw error;
        }
    },

    deleteLead: async (id) => {
        try {
            const response = await api.delete(`/leads/${id}/`);
            return response.data;
        } catch (error) {
            console.error('[leadService] Error deleting lead:', error);
            throw error;
        }
    }
};

export default leadService;
