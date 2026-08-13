import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    console.log("Interceptor Token:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization Header:", config.headers.Authorization);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
  (error) => Promise.reject(error)
);

export default api;
