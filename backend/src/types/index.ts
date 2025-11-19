/**
 * Central export point for all backend types
 */

// Auth types
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  JWTPayload,
} from "./auth.js";

// Profile types
export type {
  ProfileData,
  UserProfile,
  EnglishTest,
  StandardizedTest,
  Award,
  Extracurricular,
} from "./profile.js";

// University types
export type {
  University,
  UniversityMatch,
  Favorite,
  UniversitySearchParams,
} from "./university.js";

// Scholarship types
export type {
  Scholarship,
  ScholarshipFavorite,
  ScholarshipSearchParams,
} from "./scholarship.js";

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
} from "./task.js";

// Chat types
export type {
  Chat,
  ChatMessage,
  ChatResponse,
  CreateChatRequest,
  SendMessageRequest,
  MessageRole,
} from "./chat.js";

// AI types
export type {
  AIAnalysisResult,
  MatchingResult,
  SuggestedUniversity,
  AIScholarship,
} from "./ai.js";
