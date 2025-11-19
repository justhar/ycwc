/**
 * AI service types for CV parsing and matching
 */

import { ProfileData } from "./profile.js";
import { UniversityMatch } from "./university.js";
import { Scholarship } from "./scholarship.js";

export interface AIAnalysisResult {
  success: boolean;
  data?: ProfileData;
  error?: string;
  confidence?: number;
}

export interface MatchingResult {
  success: boolean;
  matches?: UniversityMatch[];
  suggestedUniversities?: SuggestedUniversity[];
  error?: string;
}

export interface SuggestedUniversity {
  name: string;
  location: string;
  country: string;
  reasoning: string;
  estimatedMatchScore: number;
  specialties: string[];
  type: string;
  ranking?: number;
  studentCount?: number;
  establishedYear?: number;
  tuitionRange?: string;
  acceptanceRate?: string;
  description?: string;
  website?: string;
  campusSize?: string;
  roomBoardCost?: string;
  booksSuppliesCost?: string;
  personalExpensesCost?: string;
  facilitiesInfo?: Record<string, string>;
  housingOptions?: string[];
  studentOrganizations?: string[];
  diningOptions?: string[];
  transportationInfo?: string[];
  scholarships?: AIScholarship[];
}

export interface AIScholarship {
  name: string;
  type: "fully-funded" | "partially-funded" | "tuition-only";
  amount: string;
  description: string;
  requirements: string[];
  deadline: string;
  provider: string;
  applicationUrl?: string;
  eligiblePrograms: string[];
  maxRecipients?: number;
}
