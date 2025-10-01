// api.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
    baseURL: "http://YOUR_IP_ADDRESS:3000",
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
