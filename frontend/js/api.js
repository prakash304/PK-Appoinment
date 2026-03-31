// frontend/js/api.js - Centralized API helper
const API_BASE = '/api';

// ── Generic fetch wrapper ──────────────────────────────────────────────────────
async function apiRequest(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, options);
  const data = await res.json();
  return data;
}

const api = {
  get:    (path) => apiRequest('GET', path),
  post:   (path, body) => apiRequest('POST', path, body),
  put:    (path, body) => apiRequest('PUT', path, body),
  delete: (path) => apiRequest('DELETE', path),

  // Auth
  login:     (body) => api.post('/auth/login', body),
  register:  (body) => api.post('/auth/register', body),
  logout:    () => api.post('/auth/logout'),
  session:   () => api.get('/auth/session'),

  // Categories
  getCategories: () => api.get('/categories'),
  getCategory:   (id) => api.get(`/categories/${id}`),

  // Doctors
  getDoctors:     (categoryId = '') => api.get(`/doctors${categoryId ? '?categoryId=' + categoryId : ''}`),
  getDoctorById:  (id) => api.get(`/doctors/${id}`),
  getMyDrProfile: () => api.get('/doctors/me'),

  // Appointments
  bookAppointment:       (body) => api.post('/appointments', body),
  getMyAppointments:     () => api.get('/appointments/my'),
  getDoctorAppointments: () => api.get('/appointments/doctor'),
  updateAppStatus:       (id, body) => api.put(`/appointments/${id}/status`, body),
  completeAppointment:   (id) => api.put(`/appointments/${id}/complete`),
  getAllAppointments:     () => api.get('/appointments/all'),

  // Ratings
  submitRating:    (body) => api.post('/ratings', body),
  getDoctorRatings:(id) => api.get(`/ratings/doctor/${id}`),

  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats')
};
