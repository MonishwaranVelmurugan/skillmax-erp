// Auth utility functions

export const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('a3_campus_user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

export const getCurrentUserRole = () => {
    const role = localStorage.getItem('role');
    if (role) return role;

    const user = getCurrentUser();
    return user?.role || null;
};

export const isSuperAdmin = () => {
    return getCurrentUserRole() === 'SUPERADMIN';
};

export const isAdmin = () => {
    const role = getCurrentUserRole();
    return role === 'ADMIN' || role === 'SUPERADMIN';
};

export const isAdminOrAM = () => {
    const role = getCurrentUserRole();
    return role === 'ADMIN' || role === 'SUPERADMIN' || role === 'AM';
};

export const canModifyAssignedTo = () => {
    return isAdminOrAM();
};

export const getDefaultAssignedTo = () => {
    const user = getCurrentUser();
    const role = getCurrentUserRole();
    // If ADMIN or AM, return empty (let them choose)
    if (isAdminOrAM()) {
        return '';
    }
    // Otherwise, return their own username
    return user?.username || '';
};
