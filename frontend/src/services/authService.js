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
export const getCurrentUserProfile = () => api.get("/users/me");
export const updateCurrentUserProfile = (data) => api.put("/users/me", data);
export const updateCurrentUserPassword = (data) => api.put("/users/me/password", data);
export const getProducts = (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );

  return api.get("/products/all", { params });
};
export const getAdminProducts = () => api.get("/products/admin/all");
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
export const removeProduct = (id) => api.delete(`/products/${id}`);
export const removeProducts = (productIds) => api.delete("/products/bulk", { data: { productIds } });
export const addToCart = ({ userId, productId, quantity }) =>
  api.post("/cart", null, {
    params: {
      userId,
      productId,
      quantity,
    },
  });
export const getCartByUserId = (userId) => api.get(`/cart/${userId}`);
export const updateCart = ({ userId, productId, quantity }) =>
  api.put("/cart", null, {
    params: {
      userId,
      productId,
      quantity,
    },
  });
export const removeFromCart = ({ userId, productId }) =>
  api.delete("/cart", {
    params: {
      userId,
      productId,
    },
  });
export const checkoutOrder = (data) => api.post("/orders/checkout", data);
export const getCurrentUserOrders = () => api.get("/orders/my");

export default api;
