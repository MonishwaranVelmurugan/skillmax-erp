import api from './api';

const authService = {
    getProfile: async () => {
        try {
            const response = await api.get('/profile/');
            return response.data;
        } catch (error) {
            console.error('[authService] Error fetching profile:', error);
            throw error;
        }
    },

    changePassword: async (old_password, new_password) => {
        try {
            const response = await api.post('/change-password/', {
                old_password,
                new_password
            });
            return response.data;
        } catch (error) {
            console.error('[authService] Error changing password:', error);
            throw error;
        }
    }
};

export default authService;
