"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    fullname: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:3001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem("auth-token");
    console.log("🔍 AuthContext: Checking for stored token:", storedToken);

    if (storedToken) {
      console.log(
        "✅ AuthContext: Token found, setting token and fetching profile"
      );
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      console.log("❌ AuthContext: No token found, setting loading to false");
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    console.log(
      "🚀 AuthContext: Starting fetchUserProfile with token:",
      authToken?.substring(0, 20) + "..."
    );

    try {
      console.log(
        "📡 AuthContext: Making API call to:",
        `${API_BASE_URL}/user/profile`
      );

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📥 AuthContext: API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ AuthContext: Profile data received:", data);
        setUser(data.user);
        console.log("✅ AuthContext: User set successfully");
      } else {
        console.log("❌ AuthContext: Invalid response, removing token");
        const errorText = await response.text();
        console.log("❌ AuthContext: Error response:", errorText);
        // Token is invalid, remove it
        localStorage.removeItem("auth-token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error(
        "💥 AuthContext: Network error fetching user profile:",
        error
      );
      // Don't remove token on network error - might be temporary
      // Just set user to null and let the user try again
      setUser(null);
    } finally {
      console.log("🏁 AuthContext: Setting loading to false");
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("auth-token", data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("auth-token", data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth-token");
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
