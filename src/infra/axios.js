import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('API_URL is not defined');
}
apiUrl = apiUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;