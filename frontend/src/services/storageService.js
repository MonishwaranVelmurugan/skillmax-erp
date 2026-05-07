/**
 * storageService.js
 * Simulates a backend API using the browser's localStorage.
 */

const STORAGE_KEYS = {
    LEADS: 'a3_campus_leads',
    USER: 'a3_campus_user',
    TOKEN: 'token',
    THEME: 'a3_campus_theme'
};

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const storageService = {
    // --- Leads ---

    getLeads: async () => {
        await delay();
        const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
        return leads;
    },

    addLead: async (leadData) => {
        await delay();
        const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');

        const newLead = {
            id: Date.now(), // Generate a pseudo-unique ID
            ...leadData,
            created_at: new Date().toISOString(),
            lead_status: leadData.lead_status || 'New'
        };

        leads.push(newLead);
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
        return newLead;
    },

    // --- Authentication ---

    login: async (username, password) => {
        await delay(800);
        // Mock validation - accept any non-empty credentials for now
        // or specific ones if requested.
        if (username && password) {
            const user = { username, role: 'admin' };
            const token = 'mock-jwt-token-' + Date.now();

            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);

            return { user, token };
        } else {
            throw new Error('Invalid credentials');
        }
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        // We keep the theme preference even after logout
    },

    setTheme: (theme) => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    },

    getTheme: () => {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
};

export default storageService;
