import type {
  ProfileData,
  UserProfile,
  Favorite,
  UniversityMatch,
  University,
  AIScholarship,
  SuggestedUniversity,
  MatchingResponse,
  ScholarshipFavorite,
  Task,
  Subtask,
  TaskGroup,
  TaskRecommendation,
  SuggestedTask,
  Chat,
  ChatMessage,
  ChatResponse,
  TaskPriority,
  TaskType,
  TaskStatus,
} from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
    `${API_BASE_URL}/user/favorites/universities/${universityId}`,
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
    `${API_BASE_URL}/user/favorites/universities/${universityId}`,
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
    `${API_BASE_URL}/user/favorites/universities/check/${universityId}`,
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

// Add scholarship to favorites
export const addScholarshipToFavorites = async (
  token: string,
  scholarshipId: string
): Promise<{ message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/user/favorites/scholarships/${scholarshipId}`,
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
    `${API_BASE_URL}/user/favorites/scholarships/${scholarshipId}`,
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
  const response = await fetch(`${API_BASE_URL}/user/favorites/scholarships`, {
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
    body: JSON.stringify({}),
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
    body: JSON.stringify({ 
      content: message,
      role: "user"
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to send message");
  }

  return response.json();
};

// Re-export types for convenience
export type {
  Favorite,
  UniversityMatch,
  SuggestedUniversity,
  University,
  ScholarshipFavorite,
  Task,
  Subtask,
  TaskGroup,
  TaskPriority,
  TaskStatus,
  TaskType,
};
