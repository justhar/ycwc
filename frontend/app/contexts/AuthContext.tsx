"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getUserProfile,
  updateUserProfile,
  updateUserInfo,
} from "@/lib/api";
import type { User, AuthContextType, ProfileData } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem("auth-token");

    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
      } else {
        const errorText = await response.text();
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
      setLoading(false);
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setProfileLoading(true);
    try {
      console.log("🔵 fetchProfile() called");
      const profileData = await getUserProfile(token);
      console.log("✅ fetchProfile() received:", {
        hasProfile: !!profileData.profile,
        intendedCountry: profileData.profile?.intendedCountry,
        budgetMin: profileData.profile?.budgetMin,
      });
      setProfile(profileData.profile);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
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
        // Fetch profile after login
        fetchProfile();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
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
          // Fetch profile after registration
          fetchProfile();
          return { success: true };
        } else {
          return { success: false, error: data.error || "Registration failed" };
        }
      } catch (error) {
        return { success: false, error: "Network error. Please try again." };
      }
    },
    []
  );

  const logout = useCallback(async () => {
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
      setProfile(null);
      localStorage.removeItem("auth-token");
    }
  }, [token]);

  const updateProfile = useCallback(
    async (profileData: ProfileData) => {
      if (!token) {
        return { success: false, error: "Not authenticated" };
      }

      setProfileLoading(true);
      try {
        console.log("🔵 updateProfile() called with data:", {
          intendedCountry: profileData.intendedCountry,
          budgetMin: profileData.budgetMin,
          budgetMax: profileData.budgetMax,
        });

        const response = await updateUserProfile(token, profileData);

        console.log("✅ updateProfile() response:", {
          intendedCountry: response.profile?.intendedCountry,
          budgetMin: response.profile?.budgetMin,
        });

        setProfile(response.profile);
        return { success: true };
      } catch (error: any) {
        console.error("❌ updateProfile() error:", error);
        return { success: false, error: error.message };
      } finally {
        setProfileLoading(false);
      }
    },
    [token]
  );

  const updateUserInformation = useCallback(
    async (userData: { fullName: string }) => {
      if (!token) {
        return { success: false, error: "Not authenticated" };
      }

      setProfileLoading(true);
      try {
        const response = await updateUserInfo(token, userData);
        setUser(response.user);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setProfileLoading(false);
      }
    },
    [token]
  );

  const value = {
    user,
    token,
    profile,
    login,
    register,
    logout,
    loading,
    profileLoading,
    fetchProfile,
    updateProfile,
    updateUserInformation,
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
