/**
 * Scholarship types for scholarship data
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
  scholarshipId: string;
  scholarship: Scholarship;
  createdAt: string;
}
