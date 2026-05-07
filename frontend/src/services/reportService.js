import api from './api';

const reportService = {
    // Get Tracker Stats (Staff Performance)
    getTrackerStats: async (year, month, week) => {
        try {
            const params = { year };
            if (month) params.month = month;
            if (week) params.week = week;

            const response = await api.get('/tracker/stats/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching tracker stats:', error);
            throw error;
        }
    },

    // Get Report Stats (Financial Trends)
    getReportStats: async (filterType) => {
        try {
            const response = await api.get('/reports/stats/', {
                params: { filter: filterType }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching report stats:', error);
            throw error;
        }
    }
};

export default reportService;
