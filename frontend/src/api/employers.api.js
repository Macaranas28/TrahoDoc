import api from "./axios.js";

export const getAccreditedEmployers = () => api.get("/employers/accredited");