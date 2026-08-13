import { createContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Get token from localStorage when application starts
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  // Get stored user information
  const getStoredUser = () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      return null;
    }

    return {
      userId: userId,
      fullName: localStorage.getItem("fullName"),
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
    };
  };

  const [user, setUser] = useState(getStoredUser);

  // Keep token synchronized with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // =========================
  // LOGIN
  // =========================
  const login = async (loginData) => {
    try {
      const response = await authService.login(loginData);

      console.log("AuthContext Login Response:", response);

      if (response.success) {
        const data = response.data;

        // Save token in React state
        setToken(data.token);

        // Save token immediately in localStorage
        localStorage.setItem("token", data.token);

        // Create user object
        const currentUser = {
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        };

        // Save user in React state
        setUser(currentUser);

        // Save user information in localStorage
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);

        console.log("User saved:", currentUser);
        console.log("Token saved:", data.token);

        return response;
      }

      return response;
    } catch (error) {
      console.error("AuthContext Login Error:", error);

      throw error;
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    try {
      // Call backend logout API
      await authService.logout();
    } catch (error) {
      console.error("Logout API Error:", error);
    } finally {
      // Clear React state
      setToken(null);
      setUser(null);

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
    }
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