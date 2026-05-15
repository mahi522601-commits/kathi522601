import axios from 'axios';
import { auth } from '../firebase/config';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error.response?.data?.error;

    if (apiMessage) {
      error.message = apiMessage;
    }

    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
