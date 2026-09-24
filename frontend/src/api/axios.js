import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "X-Requested-With": "TrahoDoc" },
});

// A function the AuthContext registers once it mounts, so this file
// doesn't need to import AuthContext directly (avoids a circular import).
let onUnauthorized = null;
export const registerUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.includes("/auth/me");
    const isLoginAttempt = error.config?.url?.includes("/auth/login");

    // Don't redirect for the initial "am I logged in?" check or a failed login attempt —
    // both of those are SUPPOSED to be able to return 401 without it meaning "kick the user out".
    if (error.response?.status === 401 && !isAuthCheck && !isLoginAttempt) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;