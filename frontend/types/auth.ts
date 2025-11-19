/**
 * Authentication types for user state and context
 */

import type { ProfileData } from "./profile";

export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: ProfileData | null;
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
  profileLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (
    profileData: ProfileData
  ) => Promise<{ success: boolean; error?: string }>;
  updateUserInformation: (userData: {
    fullName: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}
