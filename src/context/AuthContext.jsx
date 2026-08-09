import { createContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const storedUser = localStorage.getItem("userId")
  ? {
      userId: localStorage.getItem("userId"),
      fullName: localStorage.getItem("fullName"),
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
    }
  : null;

const [user, setUser] = useState(storedUser);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = async (loginData) => {
    const response = await authService.login(loginData);

    if (response.success) {
      const data = response.data;

      setToken(data.token);

      const currentUser = {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      setUser(currentUser);

      localStorage.setItem("userId", data.userId);
      localStorage.setItem("fullName", data.fullName);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);

      return response;
    }

    return response;
  };

  const logout = async () => {
    await authService.logout();

    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}