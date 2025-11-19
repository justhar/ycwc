/**
 * Scholarship types for scholarship data and management
 */

export interface Scholarship {
  id: string;
  name: string;
  country: string;
  type: "fully-funded" | "partially-funded" | "tuition-only";
  amount: string;
  description: string;
  requirements: string[];
  deadline: string;
  provider: string;
  applicationUrl?: string;
  eligiblePrograms: string[];
  maxRecipients?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScholarshipFavorite {
  id: string;
  userId: number;
  scholarshipId: string;
  scholarship: Scholarship;
  createdAt: string;
}

export interface ScholarshipSearchParams {
  type?: "fully-funded" | "partially-funded" | "tuition-only";
  country?: string;
  universityId?: string;
  page?: number;
  limit?: number;
}
