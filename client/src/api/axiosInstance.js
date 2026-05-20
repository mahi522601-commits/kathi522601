import axios from 'axios';
import { auth } from '../firebase/config';

const PRODUCTION_API_URL = 'https://kathi522601.onrender.com/api';

const API_URL = import.meta.env.PROD
  ? PRODUCTION_API_URL
  : import.meta.env.VITE_API_URL || PRODUCTION_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

function getLocalAdminToken() {
  const token = import.meta.env.VITE_LOCAL_ADMIN_TOKEN;

  if (!token) {
    return '';
  }

  try {
    const session = JSON.parse(localStorage.getItem('khyathi-local-session') || 'null');

    return session?.role === 'admin' ? token : '';
  } catch {
    return '';
  }
}

axiosInstance.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;

  if (user) {
    const token = await user.getIdToken();

    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const token = getLocalAdminToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

    if (
      error.response?.status === 401 &&
      window.location.pathname.startsWith('/admin')
    ) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
