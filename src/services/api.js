import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token and Environment header to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const env = sessionStorage.getItem("hm_environment");
  if (env) {
    config.headers["X-Environment"] = env;
  }
  
  return config;
});

// Handle 401 responses (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hm_token");
      localStorage.removeItem("hm_user");
      // Don't force redirect here — let the context handle it
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════
// AUTH
// ═══════════════════════════════════
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  getMe: () => api.get("/auth/me"),
  register: (data) => api.post("/auth/register", data),
};

// ═══════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════
export const bookingsAPI = {
  getAll: (params) => api.get("/bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post("/bookings", data),
  createEnquiry: (data) => api.post("/bookings/enquiry", data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  remove: (id) => api.delete(`/bookings/${id}`),
  getStats: () => api.get("/bookings/stats/dashboard"),
  getComparisonStats: () => api.get("/bookings/stats/comparison"),
};

// ═══════════════════════════════════
// EXPENSES
// ═══════════════════════════════════
export const expensesAPI = {
  getAll: (params) => api.get("/expenses", { params }),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  remove: (id) => api.delete(`/expenses/${id}`),
};

// ═══════════════════════════════════
// SETTINGS
// ═══════════════════════════════════
export const settingsAPI = {
  get: () => api.get("/settings"),
  getPublic: (slug) => api.get(`/settings/public/${slug}`),
  update: (data) => api.put("/settings", data),
  getCustomers: () => api.get("/settings/customers"),
  resetSandbox: () => api.post("/settings/sandbox/reset"),
  generateTester: (data) => api.post("/settings/tester", data),
};

export const adminAPI = {
  getTenants: () => api.get("/admin/tenants"),
  createTenant: (data) => api.post("/admin/tenants", data),
  updateSubscription: (id, data) => api.put(`/admin/tenants/${id}/subscription`, data),
  toggleSandbox: (id) => api.patch(`/admin/tenants/${id}/toggle-sandbox`),
  toggleStatus: (id) => api.patch(`/admin/tenants/${id}/status`),
};

export default api;
