import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Providers
export const getProviders = (service, location) => {
  const params = {};
  if (service) params.service = service;
  if (location) params.location = location;
  return api.get('/providers', { params });
};
export const getProviderById = (id) => api.get(`/providers/${id}`);
export const createProvider = (data) => api.post('/providers', data);
export const updateProvider = (id, data) => api.put(`/providers/${id}`, data);
export const deleteProvider = (id) => api.delete(`/providers/${id}`);

// Requests
export const getRequests = () => api.get('/requests');
export const getRequestById = (id) => api.get(`/requests/${id}`);
export const createRequest = (data) => api.post('/requests', data);
export const updateRequestStatus = (id, status) => api.put(`/requests/${id}/status`, { status });
export const deleteRequest = (id) => api.delete(`/requests/${id}`);
export const getRequestsByUser = (userId) => api.get(`/requests/user/${userId}`);
export const getRequestsByProvider = (providerId) => api.get(`/requests/provider/${providerId}`);

// Users
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);

// Admin
export const getAdminUsers = () => api.get('/admin/users');
export const updateAdminUser = (id, data) => api.patch(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminStats = () => api.get('/admin/stats');

// Services (CRUD)
export const getServices = () => api.get('/services');
export const createService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

export default api;
