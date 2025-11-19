/**
 * Central export point for all frontend types
 */

// Auth types
export type {
  User,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
} from "./auth";

// Profile types
export type {
  ProfileData,
  UserProfile,
  EnglishTest,
  StandardizedTest,
  Award,
  Extracurricular,
} from "./profile";

// University types
export type {
  University,
  UniversityMatch,
  Favorite,
  SuggestedUniversity,
  AIScholarship,
} from "./university";

// Scholarship types
export type { Scholarship, ScholarshipFavorite } from "./scholarship";

// Task types
export type {
  Task,
  Subtask,
  TaskGroup,
  TaskRecommendation,
  SuggestedTask,
  TaskPriority,
  TaskStatus,
  TaskType,
  GroupContextType,
} from "./task";

// Chat types
export type {
  Chat,
  ChatMessage,
  ChatResponse,
  ChatContextType,
  MessageRole,
} from "./chat";

// API types
export type { APIResponse, MatchingResponse, PaginatedResponse } from "./api";
