const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Helper function to get current locale
const getCurrentLocale = (): string => {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (pathname.startsWith("/en")) return "en";
    if (pathname.startsWith("/id")) return "id";
  }
  return "id"; // default
};

// Helper function to get headers with locale
const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": getCurrentLocale(),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Types for profile data
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
  englishTests?: Array<{
    id: string;
    type: string;
    customTestName?: string;
    score: string;
    date: string;
  }>;

  standardizedTests?: Array<{
    id: string;
    type: string;
    customTestName?: string;
    score: string;
    date: string;
  }>;

  awards?: Array<{
    id: string;
    title: string;
    year: string;
    level: string;
    description?: string;
  }>;

  extracurriculars?: Array<{
    id: string;
    activity: string;
    period: string;
    description?: string;
    role?: string;
  }>;
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

// Get user profile with detailed information
export const getUserProfile = async (token: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
};

// Update user profile
export const updateUserProfile = async (
  token: string,
  profileData: ProfileData
): Promise<{ message: string; profile: ProfileData }> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update profile");
  }

  return response.json();
};

// Update basic user information (name)
export const updateUserInfo = async (
  token: string,
  userData: { fullName: string }
): Promise<{ message: string; user: any }> => {
  const response = await fetch(`${API_BASE_URL}/user/info`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update user info");
  }

  return response.json();
};

// Favorites API functions
export interface Favorite {
  id: string;
  university: any; // University object
  createdAt: string;
}

// Get user's favorite universities
export const getUserFavorites = async (token: string): Promise<Favorite[]> => {
  const response = await fetch(`${API_BASE_URL}/user/favorites`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch favorites");
  }

  return response.json();
};

// Add university to favorites
export const addToFavorites = async (
  token: string,
  universityId: string,
  universityData?: any
): Promise<{ message: string; favorite: any }> => {
  const response = await fetch(
    `${API_BASE_URL}/user/favorites/${universityId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: universityData ? JSON.stringify(universityData) : undefined,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add to favorites");
  }

  return response.json();
};

// Remove university from favorites
export const removeFromFavorites = async (
  token: string,
  universityId: string
): Promise<{ message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/user/favorites/${universityId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to remove from favorites");
  }

  return response.json();
};

// Check if university is favorited
export const checkFavoriteStatus = async (
  token: string,
  universityId: string
): Promise<{ isFavorite: boolean }> => {
  const response = await fetch(
    `${API_BASE_URL}/user/favorites/check/${universityId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to check favorite status");
  }

  return response.json();
};

// AI Matching API functions
export interface UniversityMatch {
  university: any;
  matchScore: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
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
  // Additional detailed fields from AI
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

export interface MatchingResponse {
  success: boolean;
  data?: {
    matches: UniversityMatch[];
    suggestedUniversities: SuggestedUniversity[];
    totalMatches: number;
  };
  error?: string;
}

// Get AI-powered university matches based on user profile
export const getUserMatches = async (
  token: string,
  profile: ProfileData
): Promise<MatchingResponse> => {
  const response = await fetch(`${API_BASE_URL}/ai/match`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get university matches");
  }

  const data = await response.json();
  return data;
};

// Scholarship Favorites API functions
export interface ScholarshipFavorite {
  id: string;
  name: string;
  type: string;
  amount: string;
  description: string;
  requirements: string;
  deadline: string;
  provider: string;
  country: string;
  applicationUrl: string;
  eligiblePrograms: string[];
  maxRecipients: number;
  createdAt: string;
  updatedAt: string;
}

// Add scholarship to favorites
export const addScholarshipToFavorites = async (
  token: string,
  scholarshipId: string
): Promise<{ message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/user/scholarship-favorites/${scholarshipId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || "Failed to add scholarship to favorites"
    );
  }

  return response.json();
};

// Remove scholarship from favorites
export const removeScholarshipFromFavorites = async (
  token: string,
  scholarshipId: string
): Promise<{ message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/user/scholarship-favorites/${scholarshipId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || "Failed to remove scholarship from favorites"
    );
  }

  return response.json();
};

// Get user's favorite scholarships
export const getScholarshipFavorites = async (
  token: string
): Promise<ScholarshipFavorite[]> => {
  const response = await fetch(`${API_BASE_URL}/user/scholarship-favorites`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch scholarship favorites");
  }

  return response.json();
};

// ============================================
// TRACKER API FUNCTIONS
// ============================================

// Types for tracker
export type TaskPriority = "MUST" | "NEED" | "NICE";
export type TaskType = "GLOBAL" | "UNIV_SPECIFIC" | "GROUP";
export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate?: string;
  status: TaskStatus;
  groupIds?: string[];
  notes?: string;
  subtasks?: Subtask[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Subtask {
  id: string;
  taskId?: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  taskCount?: number;
  tasks?: Task[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskRecommendation {
  recommendations: {
    recommendations: Array<{
      title: string;
      type: TaskType;
      priority: TaskPriority;
      dueDate?: string;
      notes?: string;
      tags?: string[];
    }>;
  };
  profile?: {
    targetLevel?: string;
    intendedMajor?: string;
    institution?: string;
  };
  favoriteUniversities?: string[];
  favoriteScholarships?: string[];
}

// TASK API FUNCTIONS
export const getTasks = async (token: string): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch tasks");
  }

  return response.json();
};

export const createTask = async (
  token: string,
  task: Omit<Task, "id" | "createdAt" | "updatedAt" | "subtasks">
): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create task");
  }

  return response.json();
};

export const updateTask = async (
  token: string,
  taskId: string,
  updates: Partial<Task>
): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update task");
  }

  return response.json();
};

export const deleteTask = async (
  token: string,
  taskId: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete task");
  }

  return response.json();
};

// SUBTASK API FUNCTIONS
export const createSubtask = async (
  token: string,
  taskId: string,
  subtask: Omit<Subtask, "id" | "taskId" | "createdAt" | "updatedAt">
): Promise<Subtask> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/subtasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subtask),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create subtask");
  }

  return response.json();
};

export const updateSubtask = async (
  token: string,
  taskId: string,
  subtaskId: string,
  updates: Partial<Subtask>
): Promise<Subtask> => {
  const response = await fetch(
    `${API_BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update subtask");
  }

  return response.json();
};

export const deleteSubtask = async (
  token: string,
  taskId: string,
  subtaskId: string
): Promise<{ message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete subtask");
  }

  return response.json();
};

// TASK GROUP API FUNCTIONS
export const getTaskGroups = async (token: string): Promise<TaskGroup[]> => {
  const response = await fetch(`${API_BASE_URL}/task-groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch task groups");
  }

  return response.json();
};

export const createTaskGroup = async (
  token: string,
  group: Omit<
    TaskGroup,
    "id" | "taskCount" | "tasks" | "createdAt" | "updatedAt"
  >
): Promise<TaskGroup> => {
  const response = await fetch(`${API_BASE_URL}/task-groups`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(group),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create task group");
  }

  return response.json();
};

export const updateTaskGroup = async (
  token: string,
  groupId: string,
  updates: Partial<TaskGroup>
): Promise<TaskGroup> => {
  const response = await fetch(`${API_BASE_URL}/task-groups/${groupId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update task group");
  }

  return response.json();
};

export const deleteTaskGroup = async (
  token: string,
  groupId: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/task-groups/${groupId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete task group");
  }

  return response.json();
};

// AI TASK RECOMMENDATIONS
export const getTaskRecommendations = async (
  token: string,
  currentTasks?: Task[]
): Promise<TaskRecommendation> => {
  const response = await fetch(
    `${API_BASE_URL}/task-recommendations/recommendations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentTasks: currentTasks || [],
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get task recommendations");
  }

  return response.json();
};

// CHAT API FUNCTIONS
export interface SuggestedTask {
  id: string;
  title: string;
  type: "GLOBAL" | "UNIV_SPECIFIC" | "GROUP";
  priority: "MUST" | "NEED" | "NICE";
  appliesTo: string[];
  dueDate?: string;
  notes?: string;
  tags?: string[];
}

export interface Chat {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  suggestedTasks?: SuggestedTask[];
}

// Get user's chats
export const getUserChats = async (token: string): Promise<Chat[]> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch chats");
  }

  const data = await response.json();
  return data.chats;
};

// Create new chat
export const createChat = async (token: string): Promise<Chat> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create chat");
  }

  const data = await response.json();
  return data.chat;
};

// Delete chat
export const deleteChat = async (
  token: string,
  chatId: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete chat");
  }
};

// Get chat messages
export const getChatMessages = async (
  token: string,
  chatId: string
): Promise<ChatMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch messages");
  }

  const data = await response.json();
  return data.messages;
};

// Send message to chat
export const sendChatMessage = async (
  token: string,
  chatId: string,
  message: string
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to send message");
  }

  return response.json();
};
