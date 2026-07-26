import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:5007/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post('/login', data);
export const getClients = () => api.get('/clients');
export const addClient = (data) => api.post('/clients', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const importExcel = (formData) => api.post('/import/excel', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const importVCF = (formData) => api.post('/import/vcf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export default api;
