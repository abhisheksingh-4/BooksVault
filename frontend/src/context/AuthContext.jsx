import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(sessionStorage.getItem("libraflow_user") || "null");
  } catch {
    sessionStorage.removeItem("libraflow_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(() => sessionStorage.getItem("libraflow_token"));

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    sessionStorage.setItem("libraflow_token", result.token);
    sessionStorage.setItem("libraflow_user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("libraflow_token");
    sessionStorage.removeItem("libraflow_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
  }), [user, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
