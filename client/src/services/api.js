import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

// Create axios instance with default config
export const api = axios.create({
  // In development, use relative URL for proxy
  // In production, use the full API URL
  baseURL: isDevelopment ? '/api' : import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Required for CORS with credentials
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log the full error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
    
    // Handle CORS errors
    if (error.message.includes('Network Error') || error.message.includes('CORS')) {
      console.error('CORS or Network Error:', {
        message: error.message,
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Product endpoints
export const products = {
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/products/${id}`),
  markAsSold: (id, sellingPrice) => api.patch(`/products/${id}/sold`, { sellingPrice }),
};
