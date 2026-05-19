import api from './api';
const studentService = {
  createStudent: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create student',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
  getAllStudents: async () => {
    try {
      const response = await api.get('/students');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch students',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
  getStudentById: async (studentId) => {
    try {
      const response = await api.get(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch student',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await api.put(`/students/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update student',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
  deleteStudent: async (studentId) => {
    try {
      const response = await api.delete(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete student',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
  getMyProfile: async () => {
    try {
      const response = await api.get('/students/profile/me');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
  updateMyProfile: async (studentData) => {
    try {
      const response = await api.put('/students/profile/me', studentData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        errors: error.response?.data?.errors || [error.message],
      };
    }
  },
};
export default studentService;