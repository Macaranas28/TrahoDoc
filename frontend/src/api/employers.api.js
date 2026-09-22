import api from "./axios.js";

export const getAccreditedEmployers = () => api.get("/employers/accredited");
export const getMyEmployerProfile = () => api.get("/employers/me");
export const updateMyEmployerProfile = (data) => api.put("/employers/me", data);
export const submitForReview = () => api.post("/employers/me/submit");