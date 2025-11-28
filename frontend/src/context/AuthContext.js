import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// Mock credentials (works without backend)
const VALID_CREDENTIALS = {
  email: "admin@bayer.com",
  password: "admin123",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Mock authentication - validate against hardcoded credentials
      if (
        email === VALID_CREDENTIALS.email &&
        password === VALID_CREDENTIALS.password
      ) {
        // Generate a mock token
        const mockToken = "mock_jwt_token_" + Date.now();

        // Create user object
        const userData = {
          id: "admin-001",
          email: email,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
        };

        // Save to localStorage
        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setToken(mockToken);
        setUser(userData);

        return { success: true };
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    setLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Mock registration - create user without backend
      const mockToken = "mock_jwt_token_" + Date.now();

      const userData = {
        id: "user_" + Date.now(),
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
      };

      // Save to localStorage
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setToken(mockToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
