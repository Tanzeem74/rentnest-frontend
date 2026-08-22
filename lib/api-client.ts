import axios from 'axios';
import { getAccessToken, clearAuth } from './auth-helper';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                clearAuth();
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;