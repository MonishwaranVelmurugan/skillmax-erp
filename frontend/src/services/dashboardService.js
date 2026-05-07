import api from './api';

const dashboardService = {
    getDashboardStats: async () => {
        try {
            const response = await api.get('/dashboard/stats/');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
};

export default dashboardService;
