/**
 * User profile types for academic and personal information
 */

export interface EnglishTest {
  id: string;
  type: string;
  customTestName?: string;
  score: string;
  date: string;
}

export interface StandardizedTest {
  id: string;
  type: string;
  customTestName?: string;
  score: string;
  date: string;
}

export interface Award {
  id: string;
  title: string;
  year: string;
  level: string;
  description?: string;
}

export interface Extracurricular {
  id: string;
  activity: string;
  period: string;
  description?: string;
  role?: string;
}

export interface ProfileData {
  // Identity information
  dateOfBirth?: string;
  nationality?: string;

  // Academic information
  targetLevel?: string;
  intendedMajor?: string;
  institution?: string;
  graduationYear?: number;
  academicScore?: string;
  scoreScale?: string;

  // Study abroad preferences
  intendedCountry?: string;
  budgetMin?: number;
  budgetMax?: number;

  // JSON arrays
  englishTests?: EnglishTest[];
  standardizedTests?: StandardizedTest[];
  awards?: Award[];
  extracurriculars?: Extracurricular[];
}

export interface UserProfile {
  user: {
    id: number;
    fullName: string;
    email: string;
    createdAt: string;
  };
  profile: ProfileData | null;
}
