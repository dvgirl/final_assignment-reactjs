import axios from 'axios';

/**
 * ============================================================================
 * AXIOS CENTRAL API CLIENT
 * ============================================================================
 * 
 * Beginner Guide for Trainees:
 * 1. What is Axios?
 *    - A popular library used to make HTTP requests (GET, POST, PUT, DELETE)
 *      from React to the Express Node.js backend.
 * 
 * 2. Request Interceptor:
 *    - Automatically grabs the JWT token from `localStorage` and attaches it
 *      to the `Authorization: Bearer <token>` header for all secure requests.
 * 
 * 3. Response Interceptor:
 *    - Automatically extracts `response.data` so components don't need to call `.data`.
 *    - Centralizes error messages returned by Express API controllers.
 */

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically injects JWT Bearer Token into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('visitor_pass_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Returns data directly or extracts backend error message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ============================================================================
// MODULAR API HANDLERS (Organized by feature)
// ============================================================================

// 1. Authentication (Login, Register, OTP Verification, Current User)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
};

// 2. User & Staff Management (Admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getHosts: () => api.get('/users/hosts'),
  createStaff: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// 3. Appointments & Pre-Registrations (List, Create, Host Approve/Reject)
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
};

// 4. Digital Passes & Badges (QR codes, PDF streams, Walk-ins)
export const passesAPI = {
  getAll: (params) => api.get('/passes', { params }),
  getByIdentifier: (identifier) => api.get(`/passes/view/${identifier}`),
  issueWalkIn: (data) => api.post('/passes/issue-walkin', data),
  getPdfUrl: (identifier) => `/api/passes/${identifier}/pdf`,
};

// 5. Security Check-In & Check-Out (Gate scanner, Active headcount)
export const checkLogsAPI = {
  checkIn: (data) => api.post('/checklogs/check-in', data),
  checkOut: (data) => api.post('/checklogs/check-out', data),
  getActive: () => api.get('/checklogs/active'),
  getAll: (params) => api.get('/checklogs', { params }),
};

// 6. Analytics & Reports (Dashboard metrics, Email/SMS audit stream, CSV export)
export const reportsAPI = {
  getStats: () => api.get('/reports/dashboard-stats'),
  getNotifications: () => api.get('/reports/notifications'),
  getCsvUrl: () => '/api/reports/export-csv',
};

export default api;
