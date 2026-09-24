import api from "./axios.js";

export const getDashboardSummary = () => api.get("/dashboard");