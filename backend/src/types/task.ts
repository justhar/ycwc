/**
 * Task and task group types for tracker functionality
 */

export type TaskPriority = "MUST" | "NEED" | "NICE";
export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskType = "GLOBAL" | "UNIV_SPECIFIC" | "GROUP";

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  groupIds?: string[];
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
}

export interface TaskGroup {
  id: string;
  userId: number;
  name: string;
  color?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

export interface TaskRecommendation {
  title: string;
  description: string;
  priority: TaskPriority;
  reasoning: string;
  suggestedDeadline?: string;
  category?: string;
}

export interface SuggestedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  type: TaskType;
  reasoning: string;
  deadline?: string;
}
