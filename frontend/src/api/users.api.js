import api from "./axios.js";

export const getUsers = (params) => api.get("/users", { params });
export const createUser = (data) => api.post("/users", data);
export const updateUserStatus = (id, status) => api.patch(`/users/${id}/status`, { status });