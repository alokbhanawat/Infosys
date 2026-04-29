import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerUser = (data) => api.post("/users/register", data);
export const loginUser = (data) => api.post("/users/login", data);
export const getProtectedProductsMessage = () => api.get("/users/products");
export const getProducts = (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );

  return api.get("/products/all", { params });
};
export const getProductById = async (id) => {
  try {
    return await api.get(`/products/${id}`);
  } catch (error) {
    if (error?.response?.status !== 404) {
      throw error;
    }

    return api.get(`/products/get/${id}`);
  }
};
export const addProduct = (data) => api.post("/products/add", data);

export default api;
