"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  createTaskGroup,
  updateTaskGroup,
  deleteTaskGroup,
  getTaskGroups,
} from "@/lib/api";
import type { TaskGroup, GroupContextType } from "@/types";

export interface Group {
  id: string;
  name: string;
  description?: string;
  color: string;
  taskIds?: string[];
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const createGroup = useCallback(
    async (groupData: Omit<Group, "id" | "taskIds">, token: string) => {
      setLoading(true);
      try {
        const newGroup = await createTaskGroup(token, groupData);
        setGroups((prev) => [...prev, { ...newGroup, taskIds: [] }]);
      } catch (error) {
        console.error("Failed to create group:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateGroup = useCallback(
    async (groupId: string, updates: Partial<Group>, token: string) => {
      setLoading(true);
      try {
        const updatedGroup = await updateTaskGroup(token, groupId, updates);
        setGroups((prev) =>
          prev.map((group) =>
            group.id === groupId
              ? { ...updatedGroup, taskIds: group.taskIds }
              : group
          )
        );
      } catch (error) {
        console.error("Failed to update group:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteGroup = useCallback(async (groupId: string, token: string) => {
    setLoading(true);
    try {
      await deleteTaskGroup(token, groupId);
      setGroups((prev) => prev.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Failed to delete group:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGroups = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const groupsResponse: TaskGroup[] = await getTaskGroups(token);
      setGroups(
        groupsResponse.map((group: TaskGroup) => ({ ...group, taskIds: [] }))
      );
    } catch (error) {
      console.error("Failed to load groups:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <GroupContext.Provider
      value={{
        groups,
        loadGroups,
        createGroup,
        updateGroup,
        deleteGroup,
        loading,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}
