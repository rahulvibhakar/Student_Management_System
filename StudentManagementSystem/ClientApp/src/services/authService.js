import api from './api';
const authService = {
  login: async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
  signup: async (email, password, confirmPassword, role, firstName, lastName, address, phoneNumber) => {
    try {
      const response = await api.post('/auth/signup', {
        email, password, confirmPassword, role, firstName, lastName, address, phoneNumber,
      });
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  isAuthenticated: () => !!localStorage.getItem('authToken'),
};
export default authService;