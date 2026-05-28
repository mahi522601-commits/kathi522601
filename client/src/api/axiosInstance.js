import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://kathi522601.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

let authReadyPromise = null;

function waitForAuthReady() {
  if (!auth) {
    return Promise.resolve(null);
  }

  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  return authReadyPromise;
}

axiosInstance.interceptors.request.use(async (config) => {
  const user = auth?.currentUser || (await waitForAuthReady());

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
