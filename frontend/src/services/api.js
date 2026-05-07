import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// SaaS Auth Interceptor
// Automatically attaches the 'token' from localStorage as a 'Bearer' header
// and sends 'x-database' header for tenant isolation
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Use 'token' as requested
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Use 'Bearer' prefix
        }

        // Tenant Database Isolation: Send the database name with every request
        const userStr = localStorage.getItem('a3_campus_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.database_name) {
                    config.headers['x-database'] = user.database_name;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
