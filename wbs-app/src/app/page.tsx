"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import WbsTable from "@/components/WbsTable";
import GanttChart from "@/components/GanttChart";
import { LayoutGrid } from "lucide-react";

export default function Home() {
  const { treeTasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const [panelWidth, setPanelWidth] = useState(620);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const minW = 480;
      const maxW = rect.width * 0.75;
      setPanelWidth(Math.max(minW, Math.min(maxW, newWidth)));
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-6 py-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
        <LayoutGrid className="w-5 h-5 text-red-500" />
        <h1 className="text-base font-bold tracking-tight">
          WBS <span className="text-red-500">&amp;</span> Gantt
        </h1>
        <span className="text-xs text-neutral-500 ml-2">Team Project Manager</span>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden" ref={containerRef}>
        {/* WBS Panel (Left) */}
        <div
          className="flex-shrink-0 border-r border-neutral-800 flex flex-col bg-neutral-900"
          style={{ width: `${panelWidth}px` }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
              Loading...
            </div>
          ) : (
            <WbsTable
              treeTasks={treeTasks}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onAddTask={addTask}
            />
          )}
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1 flex-shrink-0 bg-neutral-800 hover:bg-red-500/60 active:bg-red-500
                     cursor-col-resize transition-colors relative group"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* Gantt Panel (Right) */}
        <div className="flex-1 flex flex-col bg-neutral-900/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
              Loading...
            </div>
          ) : (
            <GanttChart treeTasks={treeTasks} />
          )}
        </div>
      </div>
    </div>
  );
}
