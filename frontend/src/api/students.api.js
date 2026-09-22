import api from "./axios.js";

export const getMyProfile = () => api.get("/students/me");
export const updateMyProfile = (data) => api.put("/students/me", data);