import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { meRequest, loginRequest, logoutRequest } from "../api/auth.api.js";
import { registerUnauthorizedHandler } from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    try {
      const res = await meRequest();
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  // Runs whenever ANY api call anywhere in the app gets a 401 after this
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      setSessionExpired(true);
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  const login = async (email, password) => {
    const res = await loginRequest({ email, password });
    setSessionExpired(false);
    if (!res.data.data.mfaRequired) setUser(res.data.data.user);
    return res.data.data;
  };

  const completeMfaLogin = (user) => {
    setSessionExpired(false);
    setUser(user);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  };

  const clearSessionExpired = () => setSessionExpired(false);

  return (
    <AuthContext.Provider
      value={{ user, loading, sessionExpired, login, completeMfaLogin, logout, refreshUser, setUser, clearSessionExpired }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);