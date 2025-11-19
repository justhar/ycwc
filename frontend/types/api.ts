/**
 * API response types and utility types
 */

export interface APIResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface MatchingResponse {
  success: boolean;
  data?: {
    matches: import("./university.js").UniversityMatch[];
    suggestedUniversities: import("./university.js").SuggestedUniversity[];
    insertedSuggestions: any[];
    totalMatches: number;
  };
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
