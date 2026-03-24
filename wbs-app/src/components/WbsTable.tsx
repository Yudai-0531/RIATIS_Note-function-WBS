"use client";

import { Task } from "@/types/task";
import WbsRow from "./WbsRow";
import { Plus } from "lucide-react";

interface WbsTableProps {
  treeTasks: { task: Task; depth: number }[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddTask: (parentId: string | null) => void;
}

export default function WbsTable({ treeTasks, onUpdate, onDelete, onAddTask }: WbsTableProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
          WBS
        </h2>
        <button
          onClick={() => onAddTask(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700
                     text-white text-xs font-medium rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-700 text-neutral-400 text-xs uppercase tracking-wider">
              <th className="text-left py-2 px-2 font-medium">Task</th>
              <th className="text-left py-2 px-2 font-medium w-[130px]">Start</th>
              <th className="text-left py-2 px-2 font-medium w-[130px]">End</th>
              <th className="text-left py-2 px-2 font-medium w-[150px]">Progress</th>
              <th className="py-2 px-2 font-medium w-[60px]"></th>
            </tr>
          </thead>
          <tbody>
            {treeTasks.map(({ task, depth }) => (
              <WbsRow
                key={task.id}
                task={task}
                depth={depth}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddChild={(parentId) => onAddTask(parentId)}
              />
            ))}
            {treeTasks.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-neutral-500 text-sm">
                  No tasks yet. Click &quot;Add Task&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
