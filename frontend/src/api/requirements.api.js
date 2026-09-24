import api from "./axios.js";

export const getRequirements = () => api.get("/requirements");