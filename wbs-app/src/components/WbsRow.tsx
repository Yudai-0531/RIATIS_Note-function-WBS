"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { Trash2, Plus, ChevronRight } from "lucide-react";

interface WbsRowProps {
  task: Task;
  depth: number;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export default function WbsRow({ task, depth, onUpdate, onDelete, onAddChild }: WbsRowProps) {
  const [title, setTitle] = useState(task.title);

  const handleTitleBlur = () => {
    if (title !== task.title) {
      onUpdate(task.id, { title });
    }
  };

  return (
    <tr className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors group">
      {/* Task Title */}
      <td className="py-2 px-2">
        <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 20}px` }}>
          {depth > 0 && (
            <ChevronRight className="w-3 h-3 text-neutral-500 flex-shrink-0" />
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="bg-transparent border-none outline-none text-neutral-200 w-full text-sm
                       focus:ring-1 focus:ring-red-500/50 rounded px-1 py-0.5"
          />
        </div>
      </td>

      {/* Start Date */}
      <td className="py-2 px-2">
        <input
          type="date"
          value={task.start_date || ""}
          onChange={(e) => onUpdate(task.id, { start_date: e.target.value || null })}
          className="bg-transparent border border-neutral-700 rounded text-neutral-300 text-xs px-1.5 py-1
                     focus:border-red-500 outline-none w-[120px]"
        />
      </td>

      {/* End Date */}
      <td className="py-2 px-2">
        <input
          type="date"
          value={task.end_date || ""}
          onChange={(e) => onUpdate(task.id, { end_date: e.target.value || null })}
          className="bg-transparent border border-neutral-700 rounded text-neutral-300 text-xs px-1.5 py-1
                     focus:border-red-500 outline-none w-[120px]"
        />
      </td>

      {/* Progress */}
      <td className="py-2 px-2">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <input
            type="number"
            min={0}
            max={100}
            value={task.progress}
            onChange={(e) => {
              const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
              onUpdate(task.id, { progress: v });
            }}
            className="bg-transparent border border-neutral-700 rounded text-neutral-300 text-xs
                       w-12 text-center py-1 focus:border-red-500 outline-none"
          />
          <span className="text-neutral-500 text-xs">%</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-2 px-2">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(task.id)}
            className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
            title="Add subtask"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
