"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  X,
  Menu,
  Star,
  Trash2,
  Edit2,
  MoreVertical,
  Users,
  Tag,
  ArrowUpDown,
  Sparkles,
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  getTaskGroups,
  createTaskGroup,
  updateTaskGroup,
  deleteTaskGroup,
  getTaskRecommendations,
  Task,
  Subtask,
  TaskGroup,
  TaskPriority,
  TaskType,
  TaskStatus,
} from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

// Types (using Group type since TaskGroup is imported)
interface Group {
  id: string;
  name: string;
  description?: string;
  color: string;
  taskIds?: string[];
}

interface ProfileSnapshot {
  // Academic information (excluding identity fields)
  targetLevel?: string;
  intendedMajor?: string;
  institution?: string;
  graduationYear?: number;
  academicScore?: string;
  scoreScale?: string;
  englishTests?: any[];
  standardizedTests?: any[];
  awards?: any[];
  extracurriculars?: any[];
}

interface Message {
  id: string;
  name: string;
  avatarUrl: string;
  text: string;
  date: string;
  starred?: boolean;
}

// Utility
const cn = (...classes: Array<string | boolean | undefined | null>) =>
  classes.filter(Boolean).join(" ");

// Priority badge component
const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const colors = {
    MUST: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
    NEED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400",
    NICE: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
  };
  return (
    <Badge className={cn("text-xs font-semibold", colors[priority])}>
      {priority}
    </Badge>
  );
};

// Status icon component
const StatusIcon = ({ status }: { status: TaskStatus }) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "in_progress":
      return <Clock className="w-5 h-5 text-yellow-600" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
};

const PROFILE_SNAPSHOT_KEY = "profile_snapshot";

const hasProfileChanged = (
  currentProfile: ProfileSnapshot,
  storedProfile: ProfileSnapshot
): boolean => {
  const keys = [
    "targetLevel",
    "intendedMajor",
    "institution",
    "graduationYear",
    "academicScore",
    "scoreScale",
    "englishTests",
    "standardizedTests",
    "awards",
    "extracurriculars",
  ];

  return keys.some((key) => {
    const current = JSON.stringify(
      currentProfile[key as keyof ProfileSnapshot]
    );
    const stored = JSON.stringify(storedProfile[key as keyof ProfileSnapshot]);
    return current !== stored;
  });
};

// Main component
export default function ApplicationTracker() {
  const { user, token, profile } = useAuth();
  const {
    groups: contextGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useGroup();

  const router = useRouter();

  // API state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recommendation tasks (stored in localStorage as requested)
  const [recommendationTasks, setRecommendationTasks] = useState<
    Omit<Task, "id" | "status">[]
  >([]);

  // Legacy groups state for compatibility with existing UI - now synced from context
  const [groups, setGroups] = useState<Group[]>(contextGroups);

  const [messages] = useState<Message[]>([
    {
      id: "m1",
      name: "Admissions Office",
      avatarUrl: "https://i.pravatar.cc/96?img=1",
      text: "Your application has been received",
      date: "Oct 12",
      starred: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  // UI State management
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">(
    "all"
  );
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Subtask management states
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [newSubtask, setNewSubtask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  // Task editing states
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);

  // Group management states
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  // AI suggestions state
  const [loadingAISuggestions, setLoadingAISuggestions] = useState(false);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    priority: "MUST",
    status: "todo",
  });

  // Data loading effects
  useEffect(() => {
    loadData();
  }, [user, token]);

  // Sync context groups to local state
  useEffect(() => {
    setGroups(contextGroups);
  }, [contextGroups]);

  const loadData = async () => {
    if (!user || !token) return;

    setLoading(true);
    setError(null);

    try {
      // Load tasks
      const tasksResponse = await getTasks(token);
      setTasks(tasksResponse);

      // Load recommendation tasks from localStorage
      const savedRecommendations = localStorage.getItem("recommendationTasks");
      if (savedRecommendations) {
        setRecommendationTasks(JSON.parse(savedRecommendations));
        setShowRecommendations(true);
      } else {
        // If no saved recommendations, fetch new ones
        // await loadRecommendations();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getProfileSnapshot = (): ProfileSnapshot | null => {
    try {
      const stored = localStorage.getItem(PROFILE_SNAPSHOT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading profile snapshot:", error);
      return null;
    }
  };

  // Task management functions
  const handleCreateTask = async (taskData: Omit<Task, "id">) => {
    if (!token) return;
    try {
      const newTask = await createTask(token, taskData);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!token) return;
    try {
      const updatedTask = await updateTask(token, taskId, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;
    try {
      await deleteTask(token, taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
    setSelectedTask(null);
  };

  // Subtask management functions
  const handleCreateSubtask = async (
    taskId: string,
    subtaskData: Omit<Subtask, "id">
  ) => {
    if (!token) return;
    try {
      const newSubtask = await createSubtask(token, taskId, subtaskData);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, subtasks: [...(task.subtasks || []), newSubtask] }
            : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subtask");
    }
  };

  const handleUpdateSubtask = async (
    taskId: string,
    subtaskId: string,
    updates: Partial<Subtask>
  ) => {
    if (!token) return;
    try {
      const updatedSubtask = await updateSubtask(
        token,
        taskId,
        subtaskId,
        updates
      );
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks?.map((subtask) =>
                  subtask.id === subtaskId ? updatedSubtask : subtask
                ),
              }
            : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    if (!token) return;
    try {
      await deleteSubtask(token, taskId, subtaskId);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks?.filter(
                  (subtask) => subtask.id !== subtaskId
                ),
              }
            : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subtask");
    }
  };

  // Task group management functions
  const handleCreateGroup = async (
    groupData: Omit<Group, "id" | "taskIds">
  ) => {
    if (!token) return;
    await createGroup(groupData, token);
  };

  const handleUpdateGroup = async (
    groupId: string,
    updates: Partial<Group>
  ) => {
    if (!token) return;
    await updateGroup(groupId, updates, token);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!token) return;
    await deleteGroup(groupId, token);
    // Remove group association from tasks
    setTasks((prev) =>
      prev.map((task) =>
        task.groupIds?.includes(groupId)
          ? {
              ...task,
              groupIds: task.groupIds?.filter((id) => id !== groupId),
            }
          : task
      )
    );
  };

  // Recommendation task management
  const handleCreateFromRecommendation = (
    recommendation: Omit<Task, "id" | "status">
  ) => {
    const taskData: Omit<Task, "id"> = {
      ...recommendation,
      status: "todo" as const,
    };
    handleCreateTask(taskData);

    // Remove from recommendations
    const updatedRecommendations = recommendationTasks.filter(
      (task) => task.title !== recommendation.title
    );
    setRecommendationTasks(updatedRecommendations);

    // Remove localStorage if no recommendations left
    if (updatedRecommendations.length === 0) {
      localStorage.removeItem("recommendationTasks");
    } else {
      localStorage.setItem(
        "recommendationTasks",
        JSON.stringify(updatedRecommendations)
      );
    }
  };

  const handleDismissRecommendation = (
    recommendation: Omit<Task, "id" | "status">
  ) => {
    const updatedRecommendations = recommendationTasks.filter(
      (task) => task.title !== recommendation.title
    );
    setRecommendationTasks(updatedRecommendations);

    // Remove localStorage if no recommendations left
    if (updatedRecommendations.length === 0) {
      localStorage.removeItem("recommendationTasks");
    } else {
      localStorage.setItem(
        "recommendationTasks",
        JSON.stringify(updatedRecommendations)
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading your tracker...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={loadData}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    const matchesGroup =
      !selectedGroup ||
      (task.groupIds &&
        task.groupIds.length > 0 &&
        task.groupIds.includes(selectedGroup)) ||
      !task.groupIds ||
      task.groupIds.length === 0;
    return matchesSearch && matchesPriority && matchesGroup;
  });

  // Updated handlers using new API functions
  const handleToggleStatus = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus =
      task.status === "completed"
        ? "todo"
        : task.status === "in_progress"
        ? "completed"
        : "in_progress";

    handleUpdateTask(id, { status: newStatus });
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const subtask = task?.subtasks?.find((s) => s.id === subtaskId);
    if (!task || !subtask) return;

    handleUpdateSubtask(taskId, subtaskId, { completed: !subtask.completed });
  };

  // Form submission handlers for UI components
  const handleCreateTaskSubmit = () => {
    if (!newTask.title) return;

    const taskData: Omit<Task, "id"> = {
      title: newTask.title,
      priority: newTask.priority || "MUST",
      status: "todo",
      dueDate: newTask.dueDate,
      notes: newTask.notes,
      groupIds: newTask.groupIds || [],
    };

    handleCreateTask(taskData);
    setNewTask({
      title: "",
      priority: "MUST",
      status: "todo",
    });
    setIsCreating(false);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtask.title.trim()) return;

    const subtaskData: Omit<Subtask, "id"> = {
      title: newSubtask.title,
      description: newSubtask.description,
      priority: newSubtask.priority,
      completed: false,
    };

    handleCreateSubtask(selectedTask.id, subtaskData);
    setNewSubtask({ title: "", description: "", priority: "medium" });
    setShowAddSubtask(false);
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtask(subtask);
  };

  const handleUpdateSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !editingSubtask) return;

    handleUpdateSubtask(selectedTask.id, editingSubtask.id, {
      title: editingSubtask.title,
      description: editingSubtask.description,
      priority: editingSubtask.priority,
    });
    setEditingSubtask(null);
  };

  // Group management form handlers
  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowEditGroup(true);
  };

  const handleUpdateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    handleUpdateGroup(editingGroup.id, {
      name: editingGroup.name,
      description: editingGroup.description,
      color: editingGroup.color,
    });
    setEditingGroup(null);
    setShowEditGroup(false);
  };

  const handleDeleteGroupAction = (group: Group) => {
    setGroupToDelete(group);
    setShowDeleteGroup(true);
  };

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;
    handleDeleteGroup(groupToDelete.id);
    setGroupToDelete(null);
    setShowDeleteGroup(false);
  };

  const saveProfileSnapshot = (profile: ProfileSnapshot) => {
    try {
      localStorage.setItem(PROFILE_SNAPSHOT_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error("Error saving profile snapshot:", error);
    }
  };

  // AI suggestion handlers
  const handleGenerateAISuggestions = async () => {
    if (!token) {
      return;
    }

    if (!profile) {
      return;
    }
    setLoadingAISuggestions(true);

    const getAISuggestions = localStorage.getItem("recommendationTasks");

    const storedProfileSnapshot = getProfileSnapshot();
    const currentProfileSnapshot: ProfileSnapshot = {
      targetLevel: profile.targetLevel,
      intendedMajor: profile.intendedMajor,
      institution: profile.institution,
      graduationYear: profile.graduationYear,
      academicScore: profile.academicScore,
      scoreScale: profile.scoreScale,
      englishTests: profile.englishTests,
      standardizedTests: profile.standardizedTests,
      awards: profile.awards,
      extracurriculars: profile.extracurriculars,
    };

    if (
      (storedProfileSnapshot &&
        hasProfileChanged(currentProfileSnapshot, storedProfileSnapshot)) ||
      !getAISuggestions
    ) {
      try {
        const response = await getTaskRecommendations(token, tasks);

        const currentProfileSnapshot: ProfileSnapshot = {
          targetLevel: profile.targetLevel,
          intendedMajor: profile.intendedMajor,
          institution: profile.institution,
          graduationYear: profile.graduationYear,
          academicScore: profile.academicScore,
          scoreScale: profile.scoreScale,
          englishTests: profile.englishTests,
          standardizedTests: profile.standardizedTests,
          awards: profile.awards,
          extracurriculars: profile.extracurriculars,
        };
        saveProfileSnapshot(currentProfileSnapshot);

        // The response now has a 'recommendations' field with flat array of tasks
        const recommendedTasks = response.recommendations.recommendations || [];

        localStorage.setItem(
          "recommendationTasks",
          JSON.stringify(recommendedTasks)
        );

        // Check if we have tasks array
        if (Array.isArray(recommendedTasks)) {
          // Set the full task objects to state
          setRecommendationTasks(recommendedTasks);
          setShowRecommendations(true);
        } else {
          console.warn("Unexpected recommendations structure:", response);
          setRecommendationTasks([]);
        }
      } catch (err) {
        console.error("Failed to generate AI suggestions:", err);
        setRecommendationTasks([]);
      } finally {
        setLoadingAISuggestions(false);
      }
    }

    if (getAISuggestions) {
      setRecommendationTasks(JSON.parse(getAISuggestions));
      setShowRecommendations(true);
      setLoadingAISuggestions(false);
      return;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex bg-background overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  Application Tracker
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="bg-transparent border-none outline-none text-sm w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAISuggestions}
                  disabled={loadingAISuggestions}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loadingAISuggestions ? "Generating..." : "AI Suggestions"}
                </Button>

                <Button size="sm" onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>

            {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="suggested">Suggested</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </Tabs> */}
          </header>

          {/* <div className="bg-card border-b border-border px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filterPriority === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("all")}
            >
              All
            </Button>
            <Button
              variant={filterPriority === "MUST" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("MUST")}
            >
              MUST
            </Button>
            <Button
              variant={filterPriority === "NEED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("NEED")}
            >
              NEED
            </Button>
            <Button
              variant={filterPriority === "NICE" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("NICE")}
            >
              NICE
            </Button>
          </div>
        </div> */}

          {/* Task List */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="space-y-6">
              {/* AI Recommendations Section */}
              {recommendationTasks.length > 0 && showRecommendations && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-foreground">
                        AI Recommendations
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        - Suggested tasks based on your profile
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRecommendations(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendationTasks.map((recommendation, index) => (
                      <div key={index}>
                        <div className="p-4 bg-card rounded-lg shadow-sm border border-purple-100 dark:border-purple-800 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start flex-row mb-2">
                                <h3 className="font-semibold text-foreground pr-2">
                                  {recommendation.title}
                                </h3>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleCreateFromRecommendation(
                                      recommendation
                                    )
                                  }
                                  className="shrink-0 h-7 text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add to Tasks
                                </Button>
                              </div>

                              <div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {recommendation.notes ||
                                    "AI-generated recommendation"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks without group */}
              {filteredTasks.filter(
                (task) => !task.groupIds || task.groupIds.length === 0
              ).length > 0 && (
                <div className=" p-4">
                  <h2 className="text-lg font-semibold mb-4 text-foreground">
                    All tasks
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks
                      .filter(
                        (task) => !task.groupIds || task.groupIds.length === 0
                      )
                      .map((task) => (
                        <div key={task.id}>
                          <div
                            onClick={() => setSelectedTask(task)}
                            className="p-4 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center flex-row">
                                  <div className="flex items-start justify-between gap-2">
                                    <button
                                      onClick={() =>
                                        handleToggleStatus(task.id)
                                      }
                                      className="mt-1"
                                    >
                                      <StatusIcon status={task.status} />
                                    </button>
                                    <h3
                                      className={cn(
                                        "font-semibold text-foreground",
                                        task.status === "completed" &&
                                          "line-through opacity-60"
                                      )}
                                    >
                                      {task.title}
                                    </h3>
                                  </div>
                                  <button
                                    onClick={() => setSelectedTask(task)}
                                    className="p-1 rounded hover:bg-muted"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                                <div>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {task.notes || "No additional notes"}
                                  </p>
                                </div>

                                {/* Group & Priority Sections */}
                                <div className="flex flex-col gap-2 mt-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Groups:
                                    </span>
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {task.groupIds &&
                                      task.groupIds.length > 0 ? (
                                        task.groupIds.map((groupId) => {
                                          const group = groups.find(
                                            (g) => g.id === groupId
                                          );
                                          return group ? (
                                            <Badge
                                              key={groupId}
                                              variant="secondary"
                                              className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                                              title={`Remove from ${group.name}`}
                                            >
                                              {group.name}
                                            </Badge>
                                          ) : null;
                                        })
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          No groups
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Priority:
                                    </span>
                                    <PriorityBadge priority={task.priority} />
                                  </div>
                                </div>

                                <div className="mt-2 text-sm text-muted-foreground">
                                  {task.dueDate && (
                                    <span>
                                      Due:{" "}
                                      {new Date(
                                        task.dueDate
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                {/* Subtasks */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div className="mt-3 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                      Subtasks (
                                      {
                                        task.subtasks.filter(
                                          (st) => st.completed
                                        ).length
                                      }
                                      /{task.subtasks.length})
                                    </p>
                                    {task.subtasks.map((subtask) => (
                                      <div
                                        key={subtask.id}
                                        className="flex items-center gap-2 text-xs"
                                      >
                                        <button
                                          onClick={() =>
                                            handleToggleSubtask(
                                              task.id,
                                              subtask.id
                                            )
                                          }
                                          className={cn(
                                            "w-3 h-3 rounded border flex items-center justify-center",
                                            subtask.completed
                                              ? "bg-green-500 border-green-500 text-white"
                                              : "border-gray-300 hover:border-gray-400"
                                          )}
                                        >
                                          {subtask.completed && (
                                            <CheckCircle2 className="w-2 h-2" />
                                          )}
                                        </button>
                                        <span
                                          className={cn(
                                            "text-xs",
                                            subtask.completed &&
                                              "line-through opacity-60"
                                          )}
                                        >
                                          {subtask.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Tasks grouped by groups */}
              {[...groups]
                .sort((a, b) => {
                  const aTasks = filteredTasks.filter(
                    (task) => task.groupIds && task.groupIds.includes(a.id)
                  ).length;
                  const bTasks = filteredTasks.filter(
                    (task) => task.groupIds && task.groupIds.includes(b.id)
                  ).length;
                  return bTasks - aTasks;
                })
                .map((group) => {
                  const groupTasks = filteredTasks.filter(
                    (task) => task.groupIds && task.groupIds.includes(group.id)
                  );

                  return (
                    <div
                      key={group.id}
                      id={group.id}
                      className="rounded-lg p-4"
                      style={{ backgroundColor: `${group.color}15` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn("w-4 h-4 rounded-full", group.color)}
                          />
                          <h2 className="text-lg font-semibold text-foreground">
                            {group.name}
                          </h2>
                          {group.description && (
                            <p className="text-sm text-muted-foreground">
                              - {group.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditGroup(group)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Name
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditGroup(group)}
                            >
                              <Tag className="h-4 w-4 mr-2" />
                              Change Color
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteGroupAction(group)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {groupTasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupTasks.map((task) => (
                            <div key={task.id}>
                              <div
                                className="p-4 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow "
                                onClick={() => setSelectedTask(task)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center flex-row">
                                      <div className="flex items-start justify-between gap-2">
                                        <button
                                          onClick={() =>
                                            handleToggleStatus(task.id)
                                          }
                                          className="mt-1"
                                        >
                                          <StatusIcon status={task.status} />
                                        </button>
                                        <h3
                                          className={cn(
                                            "font-semibold text-foreground",
                                            task.status === "completed" &&
                                              "line-through opacity-60"
                                          )}
                                        >
                                          {task.title}
                                        </h3>
                                      </div>
                                      <button
                                        onClick={() => setSelectedTask(task)}
                                        className="p-1 rounded hover:bg-muted"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div>
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {task.notes || "No additional notes"}
                                      </p>
                                    </div>

                                    {/* Group & Priority Sections */}
                                    <div className="flex flex-col gap-2 mt-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          Groups:
                                        </span>
                                        <div className="flex items-center gap-1 flex-wrap">
                                          {task.groupIds &&
                                          task.groupIds.length > 0 ? (
                                            task.groupIds.map((groupId) => {
                                              const group = groups.find(
                                                (g) => g.id === groupId
                                              );
                                              return group ? (
                                                <Badge
                                                  key={groupId}
                                                  variant="secondary"
                                                  className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                                                  title={`Remove from ${group.name}`}
                                                >
                                                  {group.name}
                                                </Badge>
                                              ) : null;
                                            })
                                          ) : (
                                            <span className="text-xs text-muted-foreground">
                                              No groups
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          Priority:
                                        </span>
                                        <PriorityBadge
                                          priority={task.priority}
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-2 text-sm text-muted-foreground">
                                      {task.dueDate && (
                                        <span>
                                          Due:{" "}
                                          {new Date(
                                            task.dueDate
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>

                                    {/* Subtasks */}
                                    {task.subtasks &&
                                      task.subtasks.length > 0 && (
                                        <div className="mt-3 space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground mb-2">
                                            Subtasks (
                                            {
                                              task.subtasks.filter(
                                                (st) => st.completed
                                              ).length
                                            }
                                            /{task.subtasks.length})
                                          </p>
                                          {task.subtasks.map((subtask) => (
                                            <div
                                              key={subtask.id}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              <button
                                                onClick={() =>
                                                  handleToggleSubtask(
                                                    task.id,
                                                    subtask.id
                                                  )
                                                }
                                                className={cn(
                                                  "w-3 h-3 rounded border flex items-center justify-center",
                                                  subtask.completed
                                                    ? "bg-green-500 border-green-500 text-white"
                                                    : "border-gray-300 hover:border-gray-400"
                                                )}
                                              >
                                                {subtask.completed && (
                                                  <CheckCircle2 className="w-2 h-2" />
                                                )}
                                              </button>
                                              <span
                                                className={cn(
                                                  "text-xs",
                                                  subtask.completed &&
                                                    "line-through opacity-60"
                                                )}
                                              >
                                                {subtask.title}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No tasks in this group. Create one to get started!
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No tasks found. Create one to get started!
              </div>
            )}
          </main>
        </div>

        {/* Create Task Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Title
                    </label>
                    <Input
                      value={newTask.title || ""}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="Task title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Group
                    </label>
                    <Select
                      value={newTask.groupIds?.[0] || ""}
                      onValueChange={(value) =>
                        setNewTask({
                          ...newTask,
                          groupIds: value ? [value] : [],
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No group</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full",
                                  group.color
                                )}
                              />
                              {group.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Priority
                    </label>
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2"
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          priority: e.target.value as TaskPriority,
                        })
                      }
                    >
                      <option value="MUST">MUST</option>
                      <option value="NEED">NEED</option>
                      <option value="NICE">NICE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Notes
                    </label>
                    <Textarea
                      value={newTask.notes || ""}
                      onChange={(e) =>
                        setNewTask({ ...newTask, notes: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={newTask.dueDate || ""}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateTaskSubmit} className="flex-1">
                      Create Task
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Task Detail Drawer */}
        <Dialog
          open={!!selectedTask}
          onOpenChange={() => setSelectedTask(null)}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTask?.title}</DialogTitle>
              <DialogDescription>
                Groups:{" "}
                {selectedTask?.groupIds
                  ?.map((id) => groups.find((g) => g.id === id)?.name)
                  .filter(Boolean)
                  .join(", ") || "No groups"}
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Groups</h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    {selectedTask.groupIds?.map((groupId) => {
                      const group = groups.find((g) => g.id === groupId);
                      return group ? (
                        <div
                          key={groupId}
                          className="group relative inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          <span>{group.name}</span>
                          <button
                            onClick={() => {
                              // Remove group from task
                              const updatedGroupIds =
                                selectedTask.groupIds?.filter(
                                  (id) => id !== groupId
                                ) || [];
                              handleUpdateTask(selectedTask.id, {
                                groupIds: updatedGroupIds,
                              });
                              // Update selectedTask state immediately
                              setSelectedTask({
                                ...selectedTask,
                                groupIds: updatedGroupIds,
                              });
                            }}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                          title="Add to group"
                        >
                          +
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {groups
                          .filter(
                            (group) =>
                              !selectedTask.groupIds?.includes(group.id)
                          )
                          .map((group) => (
                            <DropdownMenuItem
                              key={group.id}
                              onClick={() => {
                                const updatedGroupIds = [
                                  ...(selectedTask.groupIds || []),
                                  group.id,
                                ];
                                handleUpdateTask(selectedTask.id, {
                                  groupIds: updatedGroupIds,
                                });
                                // Update selectedTask state immediately
                                setSelectedTask({
                                  ...selectedTask,
                                  groupIds: updatedGroupIds,
                                });
                              }}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full",
                                  group.color
                                )}
                              />
                              {group.name}
                            </DropdownMenuItem>
                          ))}
                        {groups.filter(
                          (group) => !selectedTask.groupIds?.includes(group.id)
                        ).length === 0 && (
                          <DropdownMenuItem
                            disabled
                            className="text-muted-foreground"
                          >
                            No available groups
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {(!selectedTask.groupIds ||
                    selectedTask.groupIds.length === 0) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No groups assigned
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Priority</h4>
                  <Select
                    value={selectedTask.priority}
                    onValueChange={(value: TaskPriority) => {
                      const updatedTask = { ...selectedTask, priority: value };
                      setTasks(
                        tasks.map((task) =>
                          task.id === selectedTask.id ? updatedTask : task
                        )
                      );
                      setSelectedTask(updatedTask);
                      // Save immediately
                      handleUpdateTask(selectedTask.id, { priority: value });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={selectedTask.priority} />
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MUST">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                            MUST
                          </Badge>
                          <span className="text-xs text-muted-foreground">Critical</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="NEED">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">
                            NEED
                          </Badge>
                          <span className="text-xs text-muted-foreground">Important</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="NICE">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                            NICE
                          </Badge>
                          <span className="text-xs text-muted-foreground">Optional</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Due Date</h4>
                  {editingDueDate ? (
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={selectedTask.dueDate || ""}
                        onChange={(e) => {
                          const updatedTask = {
                            ...selectedTask,
                            dueDate: e.target.value,
                          };
                          setTasks(
                            tasks.map((task) =>
                              task.id === selectedTask.id ? updatedTask : task
                            )
                          );
                          setSelectedTask(updatedTask);
                        }}
                        onBlur={() => {
                          // Save due date when losing focus
                          handleUpdateTask(selectedTask.id, {
                            dueDate: selectedTask.dueDate,
                          });
                          setEditingDueDate(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateTask(selectedTask.id, {
                              dueDate: selectedTask.dueDate,
                            });
                            setEditingDueDate(false);
                          }
                          if (e.key === "Escape") {
                            setEditingDueDate(false);
                          }
                        }}
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Press Enter to save, Escape to cancel
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => setEditingDueDate(true)}
                      title="Click to edit due date"
                    >
                      {selectedTask.dueDate
                        ? new Date(selectedTask.dueDate).toLocaleDateString()
                        : "No due date set. Click to set due date."}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Select
                    value={selectedTask.status}
                    onValueChange={(value: TaskStatus) => {
                      const updatedTask = { ...selectedTask, status: value };
                      setTasks(
                        tasks.map((task) =>
                          task.id === selectedTask.id ? updatedTask : task
                        )
                      );
                      setSelectedTask(updatedTask);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={selectedTask.status} />
                          <span className="capitalize">
                            {selectedTask.status.replace("_", " ")}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span>To Do</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  {editingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={selectedTask.notes || ""}
                        onChange={(e) => {
                          const updatedTask = {
                            ...selectedTask,
                            notes: e.target.value,
                          };
                          setTasks(
                            tasks.map((task) =>
                              task.id === selectedTask.id ? updatedTask : task
                            )
                          );
                          setSelectedTask(updatedTask);
                        }}
                        onBlur={() => {
                          // Save notes when losing focus
                          handleUpdateTask(selectedTask.id, {
                            notes: selectedTask.notes,
                          });
                          setEditingNotes(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            handleUpdateTask(selectedTask.id, {
                              notes: selectedTask.notes,
                            });
                            setEditingNotes(false);
                          }
                          if (e.key === "Escape") {
                            setEditingNotes(false);
                          }
                        }}
                        placeholder="Add notes..."
                        className="min-h-[100px]"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Press Ctrl+Enter to save, Escape to cancel
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => setEditingNotes(true)}
                      title="Click to edit notes"
                    >
                      {selectedTask.notes ||
                        "No notes added. Click to add notes."}
                    </p>
                  )}
                </div>

                {/* Subtasks Management Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">
                      Subtasks ({selectedTask.subtasks?.length || 0})
                    </h4>
                    <div className="flex items-center gap-2">
                      <Dialog
                        open={showAddSubtask}
                        onOpenChange={setShowAddSubtask}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Subtask
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Subtask</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleAddSubtaskSubmit}
                            className="space-y-4"
                          >
                            <div>
                              <Label
                                htmlFor="subtask-title"
                                className="mb-2 block"
                              >
                                Title
                              </Label>
                              <Input
                                id="subtask-title"
                                value={newSubtask.title}
                                onChange={(e) =>
                                  setNewSubtask({
                                    ...newSubtask,
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Enter subtask title"
                                required
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="subtask-description"
                                className="mb-2 block"
                              >
                                Description (Optional)
                              </Label>
                              <Textarea
                                id="subtask-description"
                                value={newSubtask.description}
                                onChange={(e) =>
                                  setNewSubtask({
                                    ...newSubtask,
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Enter subtask description"
                                className="min-h-[80px]"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="subtask-priority"
                                className="mb-2 block"
                              >
                                Priority
                              </Label>
                              <Select
                                value={newSubtask.priority}
                                onValueChange={(value) =>
                                  setNewSubtask({
                                    ...newSubtask,
                                    priority: value as
                                      | "low"
                                      | "medium"
                                      | "high",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddSubtask(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Add Subtask</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSubtasks(!showSubtasks)}
                      >
                        {showSubtasks ? "Hide" : "Show"} (
                        {selectedTask.subtasks?.length || 0})
                      </Button>
                    </div>
                  </div>

                  {showSubtasks && (
                    <div className="space-y-3">
                      {selectedTask.subtasks?.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                        >
                          <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={(checked) =>
                              handleToggleSubtask(selectedTask.id, subtask.id)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-medium text-sm ${
                                  subtask.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {subtask.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {subtask.priority}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditSubtask(subtask)}
                                    >
                                      <Edit2 className="h-3 w-3 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteSubtask(
                                          selectedTask.id,
                                          subtask.id
                                        )
                                      }
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            {subtask.description && (
                              <p
                                className={`text-xs text-muted-foreground ${
                                  subtask.completed ? "line-through" : ""
                                }`}
                              >
                                {subtask.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">
                            No subtasks added yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click "Add Subtask" to get started
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleDeleteTask(selectedTask.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Subtask Dialog */}
        <Dialog
          open={!!editingSubtask}
          onOpenChange={() => setEditingSubtask(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subtask</DialogTitle>
            </DialogHeader>
            {editingSubtask && (
              <form onSubmit={handleUpdateSubtaskSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-subtask-title">Title</Label>
                  <Input
                    id="edit-subtask-title"
                    value={editingSubtask.title}
                    onChange={(e) =>
                      setEditingSubtask({
                        ...editingSubtask,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter subtask title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-subtask-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="edit-subtask-description"
                    value={editingSubtask.description || ""}
                    onChange={(e) =>
                      setEditingSubtask({
                        ...editingSubtask,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter subtask description"
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-subtask-priority">Priority</Label>
                  <Select
                    value={editingSubtask.priority}
                    onValueChange={(value) =>
                      setEditingSubtask({
                        ...editingSubtask,
                        priority: value as "low" | "medium" | "high",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSubtask(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Subtask</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Group Dialog */}
        <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            {editingGroup && (
              <form onSubmit={handleUpdateGroupSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-group-name">Group Name</Label>
                  <Input
                    id="edit-group-name"
                    value={editingGroup.name}
                    onChange={(e) =>
                      setEditingGroup({ ...editingGroup, name: e.target.value })
                    }
                    placeholder="Enter group name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-group-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="edit-group-description"
                    value={editingGroup.description || ""}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter group description"
                    className="min-h-[60px]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-group-color">Color</Label>
                  <Select
                    value={editingGroup.color}
                    onValueChange={(value) =>
                      setEditingGroup({ ...editingGroup, color: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-blue-500">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          Blue
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-green-500">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          Green
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-purple-500">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500" />
                          Purple
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-orange-500">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          Orange
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-pink-500">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-pink-500" />
                          Pink
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditGroup(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Group</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Group Confirmation Dialog */}
        <Dialog open={showDeleteGroup} onOpenChange={setShowDeleteGroup}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Group</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the group "{groupToDelete?.name}
                "? All tasks in this group will be moved to ungrouped tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteGroup(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteGroup}>
                Delete Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
