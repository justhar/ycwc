/**
 * Authentication types for login, registration, and JWT responses
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  token: string;
}

export interface JWTPayload {
  userId: number;
  iat?: number;
  exp?: number;
}
