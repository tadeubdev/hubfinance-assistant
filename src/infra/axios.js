import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('API_URL is not defined');
}
apiUrl = apiUrl.replace(/\/$/, '');

export const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
