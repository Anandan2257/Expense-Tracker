import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Categories
export const getCategories = (type) => API.get('/categories', { params: { type } });
export const createCategory = (data) => API.post('/categories', data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
export const seedCategories = () => API.post('/categories/seed');

// Transactions
export const getTransactions = (params) => API.get('/transactions', { params });
export const getSummary = (params) => API.get('/transactions/summary', { params });
export const getByCategory = (params) => API.get('/transactions/by-category', { params });
export const getDailyTrend = (params) => API.get('/transactions/daily', { params });
export const createTransaction = (data) => API.post('/transactions', data);
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getAccountStats = () => API.get('/transactions/account-stats');

// Budgets
export const getBudgets = (params) => API.get('/budgets', { params });
export const createBudget = (data) => API.post('/budgets', data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);
