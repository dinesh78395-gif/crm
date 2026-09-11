import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
};

export const dashboardAPI = {
  getOverview: () => API.get('/dashboard/overview'),
  getFinancial: () => API.get('/dashboard/financial'),
};

export const crmAPI = {
  getLeads: () => API.get('/crm/leads'),
  createLead: (data) => API.post('/crm/leads', data),
  getLeadDetail: (id) => API.get(`/crm/leads/${id}`),
  updateLead: (id, data) => API.put(`/crm/leads/${id}`, data),
  addFollowup: (leadId, data) => API.post(`/crm/leads/${leadId}/followups`, data),
  convertLead: (leadId, data) => API.post(`/crm/leads/${leadId}/convert`, data || {}),
  getFollowups: () => API.get('/crm/followups'),
  completeFollowup: (followupId, data) => API.post(`/crm/followups/${followupId}/complete`, data),
  getCustomers: () => API.get('/crm/customers'),
  getCustomer360: (id) => API.get(`/crm/customers/${id}/360`),
};

export const trainingAPI = {
  getPrograms: () => API.get('/training/programs'),
  createProgram: (data) => API.post('/training/programs', data),
  getTrainers: () => API.get('/training/trainers'),
  createTrainer: (data) => API.post('/training/trainers', data),
  getBatches: () => API.get('/training/batches'),
  getBatchDetail: (id) => API.get(`/training/batches/${id}`),
  createBatch: (data) => API.post('/training/batches', data),
  getStudents: () => API.get('/training/students'),
  createStudent: (data) => API.post('/training/students', data),
  enrollStudent: (batchId, studentId) => API.post(`/training/batches/${batchId}/enroll?student_id=${studentId}`),
  getBatchSessions: (batchId) => API.get(`/training/batches/${batchId}/sessions`),
  getTrainerSessions: () => API.get('/training/trainer/sessions'),
  getSessionAttendance: (sessionId) => API.get(`/training/sessions/${sessionId}/attendance`),
  recordAttendance: (data) => API.post('/training/attendance', data),
  getPendingAssignments: () => API.get('/training/pending-assignments'),
  assignTrainer: (batchId, data) => API.post(`/training/batches/${batchId}/assign-trainer`, data),
};

export const financeAPI = {
  getInvoices: () => API.get('/finance/invoices'),
  createInvoice: (data) => API.post('/finance/invoices', data),
  getInvoicePaymentInfo: (id) => API.get(`/finance/invoices/${id}/payment-info`),
  getPayments: () => API.get('/finance/payments'),
  recordPayment: (data) => API.post('/finance/payments', data),
  getExpenses: () => API.get('/finance/expenses'),
  createExpense: (data) => API.post('/finance/expenses', data),
  getVendors: () => API.get('/finance/vendors'),
  createVendor: (data) => API.post('/finance/vendors', data),
};

export const managementAPI = {
  queryAssistant: (q) => API.get('/management/assistant/query', { params: { q } }),
};

export default API;
