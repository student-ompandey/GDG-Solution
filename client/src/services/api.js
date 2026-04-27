import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const scanUrl = (url, lang = 'en') => api.post('/scan/url', { url, lang });
export const scanMessage = (message, lang = 'en') => api.post('/scan/message', { message, lang });

export const scanQr = (file, lang = 'en') => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/scan/qr?lang=${lang}`, form, { timeout: 120000, headers: { 'Content-Type': 'multipart/form-data' } });
};

export const scanImage = (file, lang = 'en') => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/scan/image?lang=${lang}`, form, { timeout: 120000, headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getHistory = (params = {}) => api.get('/history', { params });
export const sendChatMessage = (message, history, context) => api.post('/chat', { message, history, context });

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');

export default api;
