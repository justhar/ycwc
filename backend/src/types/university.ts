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
  userId: number;
  universityId: string;
  university: University;
  createdAt: string;
}

export interface UniversitySearchParams {
  country?: string;
  type?: "public" | "private";
  minRanking?: number;
  maxRanking?: number;
  page?: number;
  limit?: number;
}
