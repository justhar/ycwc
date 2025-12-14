/**
 * Authentication Service
 * Handles business logic for user authentication and authorization
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/index.js";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  JWTPayload,
} from "../types/index.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Validate input
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }

    if (data.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
    });

    // Generate JWT token
    const token = this.generateToken({ userId: user.id });

    return {
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName || "",
      },
    };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Validate input
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }

    // Find user
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = this.generateToken({ userId: user.id });

    return {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName || "",
      },
    };
  }

  /**
   * Verify JWT token and return payload
   */
  verifyToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return payload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  }

  /**
   * Get user by ID (for middleware/protected routes)
   */
  async getUserById(userId: number) {
    return await userRepository.findById(userId);
  }
}

export const authService = new AuthService();
