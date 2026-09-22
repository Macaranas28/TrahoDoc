import api from "./axios.js";

export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const logoutRequest = () => api.post("/auth/logout");
export const meRequest = () => api.get("/auth/me");
export const changePasswordRequest = (data) => api.post("/auth/change-password", data);