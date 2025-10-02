// api.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";
const API_BASE = "https://money-tracker-95ny.onrender.com";
const api = axios.create({
    baseURL: `${API_BASE}`,
});

// Interceptor: attach token before every request
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
