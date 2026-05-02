import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import useAuthStore from '../features/auth/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
});

// Request interceptor for JWT injection and Idempotency-Key generation
apiClient.interceptors.request.use(
  (config) => {
    // Inject JWT token if available
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Idempotency-Key for POST requests
    if (config.method?.toUpperCase() === 'POST') {
      config.headers['Idempotency-Key'] = uuidv4();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth store on 401
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
