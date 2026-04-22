import axios from "axios";

const API_URL = "http://localhost:8080/api/users";

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// ✅ Add interceptor (AUTO ADD TOKEN)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// APIs
export const registerUser = (data) => api.post("/register", data);
export const loginUser = (data) => api.post("/login", data);

// Example protected API
export const getUserData = () => api.get("/profile");