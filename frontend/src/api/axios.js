import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the httpOnly auth cookie
  headers: { "X-Requested-With": "TrahoDoc" }, // matches the backend's CSRF guard
});

export default api;