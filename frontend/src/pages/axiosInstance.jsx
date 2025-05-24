import axios from 'axios';

const baseURL = 'http://localhost:8000/';

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('access'),
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
});

// Auto-refresh token
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh')
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(`${baseURL}api/auth/token/refresh/`, {
          refresh: localStorage.getItem('refresh'),
        });

        localStorage.setItem('access', res.data.access);
        axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + res.data.access;
        originalRequest.headers['Authorization'] = 'Bearer ' + res.data.access;

        return axiosInstance(originalRequest);
      } catch (err) {
        console.error('Token refresh failed:', err);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login'; // redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;