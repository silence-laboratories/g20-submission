import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  withCredentials: true, // Always send cookies for refresh token
  timeout: 10000
});

// Request interceptor to add access token to requests
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     // Get access token from localStorage
//     const accessToken = localStorage.getItem('access_token');

//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Response interceptor to handle token refresh
// api.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // If we get 401 and haven't already tried to refresh
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // Try to refresh the token using the httpOnly cookie
//         const refreshResponse = await axios.post(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/auth/refresh`,
//           {},
//           {
//             withCredentials: true, // Send the refresh token cookie
//           }
//         );

//         const { access_token } = refreshResponse.data;

//         // Update stored access token
//         localStorage.setItem('access_token', access_token);

//         // Retry the original request with new token
//         originalRequest.headers.Authorization = `Bearer ${access_token}`;
//         return api(originalRequest);

//       } catch (refreshError) {
//         // Refresh failed, redirect to login
//         localStorage.removeItem('access_token');

//         // Only redirect if we're not already on the login page
//         if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
//           window.location.href = '/';
//         }

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;

// Helper functions for common API operations
export const apiClient = {
  // Authentication endpoints
  auth: {
    googleCallback: (code: string) =>
      api.get(`/api/v1/auth/google/callback?code=${code}`),
    getCurrentUser: () =>
      api.get('/api/v1/auth/me', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      }),
    logout: () => api.post('/api/v1/auth/logout'),
    refresh: () => api.post('/api/v1/auth/refresh')
  },

  // User endpoints
  users: {
    get: (id: string) => api.get(`/api/v1/users/${id}`),
    list: (params?: any) => api.get('/api/v1/users', { params })
  },

  // SME endpoints
  sme: {
    get: (id: number) => api.get(`/api/v1/sme/${id}`),
    create: (data: any) => api.post('/api/v1/sme', data)
  },

  // Bank endpoints
  bank: {
    get: (id: number) => api.get(`/api/v1/bank/${id}`),
    getByCountry: (country: string) =>
      api.get(`/api/v1/bank/country/${country}`),
    create: (data: any) => api.post('/api/v1/bank', data)
  },

  // Loan endpoints
  loans: {
    get: (id: string) => api.get(`/api/v1/loan/${id}`),
    create: (data: any) => api.post('/api/v1/loan', data),
    getAll: () => api.get('/api/v1/loans'),
    getByBank: (bankId: number) => api.get(`/api/v1/loan/bank/${bankId}`),
    getBySME: (smeId: number) => api.get(`/api/v1/loan/sme/${smeId}`),
    updateLoan: (id: string, data: any) => api.patch(`/api/v1/loan/${id}`, data)
  }
};
