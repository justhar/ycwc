/**
 * University types for university data and matching
 */

export interface University {
  id: string;
  name: string;
  location: string;
  country: string;
  ranking: number;
  studentCount: number;
  establishedYear: number;
  type: "public" | "private";
  tuitionRange: string;
  acceptanceRate: string;
  description: string;
  website: string;
  imageUrl?: string;
  specialties?: string[];
  campusSize?: string;
  roomBoardCost?: string;
  booksSuppliesCost?: string;
  personalExpensesCost?: string;
  facilitiesInfo?: {
    library?: string;
    recreationCenter?: string;
    researchLabs?: string;
    healthServices?: string;
    [key: string]: string | undefined;
  };
  housingOptions?: string[];
  studentOrganizations?: string[];
  diningOptions?: string[];
  transportationInfo?: string[];
  source?: "manual" | "ai_suggested";
  createdAt?: string;
  updatedAt?: string;
}

export interface UniversityMatch {
  university: University;
  matchScore: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
}

export interface Favorite {
  id: string;
  university: University;
  createdAt: string;
}

export interface SuggestedUniversity {
  id?: string;
  name: string;
  location: string;
  country: string;
  reasoning: string;
  estimatedMatchScore: number;
  specialties: string[];
  type: string;
  source?: "ai_suggested" | "manual";
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
  facilitiesInfo?: {
    library?: string;
    recreationCenter?: string;
    researchLabs?: string;
    healthServices?: string;
    [key: string]: string | undefined;
  };
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
