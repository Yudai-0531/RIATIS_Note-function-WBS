"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Task } from "@/types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }
    setTasks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const addTask = async (parentId: string | null = null) => {
    const maxOrder = tasks.length > 0
      ? Math.max(...tasks.map((t) => t.sort_order))
      : -1;

    const { error } = await supabase.from("tasks").insert({
      title: "New Task",
      parent_id: parentId,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      progress: 0,
      sort_order: maxOrder + 1,
    });

    if (error) console.error("Error adding task:", error);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id);

    if (error) console.error("Error updating task:", error);
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) console.error("Error deleting task:", error);
  };

  // Build a tree structure for display
  const getTreeTasks = useCallback(() => {
    const rootTasks = tasks.filter((t) => !t.parent_id);
    const result: { task: Task; depth: number }[] = [];

    const addChildren = (parentId: string, depth: number) => {
      const children = tasks.filter((t) => t.parent_id === parentId);
      for (const child of children) {
        result.push({ task: child, depth });
        addChildren(child.id, depth + 1);
      }
    };

    for (const root of rootTasks) {
      result.push({ task: root, depth: 0 });
      addChildren(root.id, 1);
    }

    return result;
  }, [tasks]);

  return { tasks, treeTasks: getTreeTasks(), loading, addTask, updateTask, deleteTask };
}
