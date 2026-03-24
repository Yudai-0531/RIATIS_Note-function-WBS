"use client";

import { useMemo } from "react";
import { Task } from "@/types/task";
import {
  differenceInDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  isWeekend,
  max as dateMax,
  min as dateMin,
  parseISO,
  addDays,
} from "date-fns";

interface GanttChartProps {
  treeTasks: { task: Task; depth: number }[];
}

const DAY_WIDTH = 28;
const ROW_HEIGHT = 37; // matches WBS row height
const HEADER_HEIGHT = 62;

export default function GanttChart({ treeTasks }: GanttChartProps) {
  const { days, months, minDate } = useMemo(() => {
    const tasksWithDates = treeTasks
      .map((t) => t.task)
      .filter((t) => t.start_date && t.end_date);

    if (tasksWithDates.length === 0) {
      // Default: show current month
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return {
        days: eachDayOfInterval({ start, end }),
        months: [{ month: start, days: eachDayOfInterval({ start, end }).length }],
        minDate: start,
      };
    }

    const allStarts = tasksWithDates.map((t) => parseISO(t.start_date!));
    const allEnds = tasksWithDates.map((t) => parseISO(t.end_date!));

    const start = addDays(dateMin(allStarts), -3);
    const end = addDays(dateMax(allEnds), 7);

    const allDays = eachDayOfInterval({ start, end });
    const monthStarts = eachMonthOfInterval({ start, end });

    const monthData = monthStarts.map((ms) => {
      const monthEnd = endOfMonth(ms);
      const daysInRange = allDays.filter(
        (d) => d >= ms && d <= monthEnd
      ).length;
      return { month: ms, days: daysInRange };
    });

    return { days: allDays, months: monthData, minDate: start };
  }, [treeTasks]);

  const totalWidth = days.length * DAY_WIDTH;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
          Gantt Chart
        </h2>
      </div>

      {/* Chart */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: totalWidth }}>
          {/* Month headers */}
          <div className="flex border-b border-neutral-700 sticky top-0 bg-neutral-900 z-10">
            {months.map(({ month, days: dayCount }) => (
              <div
                key={month.toISOString()}
                style={{ width: dayCount * DAY_WIDTH }}
                className="text-center text-xs text-neutral-400 font-medium py-1 border-r border-neutral-800"
              >
                {format(month, "MMM yyyy")}
              </div>
            ))}
          </div>

          {/* Day headers */}
          <div className="flex border-b border-neutral-700 sticky top-[25px] bg-neutral-900 z-10">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                style={{ width: DAY_WIDTH }}
                className={`text-center text-[10px] py-1 border-r border-neutral-800/50
                  ${isWeekend(day) ? "text-neutral-600 bg-neutral-800/30" : "text-neutral-500"}`}
              >
                {format(day, "d")}
              </div>
            ))}
          </div>

          {/* Task bars */}
          <div className="relative">
            {/* Weekend background columns */}
            <div className="absolute inset-0 flex pointer-events-none">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  style={{ width: DAY_WIDTH }}
                  className={isWeekend(day) ? "bg-neutral-800/20" : ""}
                />
              ))}
            </div>

            {/* Today line */}
            {(() => {
              const today = new Date();
              const todayOffset = differenceInDays(today, minDate);
              if (todayOffset >= 0 && todayOffset < days.length) {
                return (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500/60 z-20"
                    style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
                  />
                );
              }
              return null;
            })()}

            {/* Bars */}
            {treeTasks.map(({ task, depth }, index) => {
              if (!task.start_date || !task.end_date) {
                return (
                  <div
                    key={task.id}
                    style={{ height: ROW_HEIGHT }}
                    className="border-b border-neutral-800/50"
                  />
                );
              }

              const startOffset = differenceInDays(parseISO(task.start_date), minDate);
              const duration = differenceInDays(parseISO(task.end_date), parseISO(task.start_date)) + 1;
              const left = startOffset * DAY_WIDTH;
              const width = duration * DAY_WIDTH;

              const isParent = treeTasks.some(
                (t) => t.task.parent_id === task.id
              );

              return (
                <div
                  key={task.id}
                  style={{ height: ROW_HEIGHT }}
                  className="relative border-b border-neutral-800/50"
                >
                  <div
                    className="absolute top-[10px] flex items-center"
                    style={{ left, width: Math.max(width, DAY_WIDTH) }}
                  >
                    {isParent ? (
                      /* Parent task: diamond markers */
                      <div className="w-full relative h-[6px]">
                        <div className="absolute inset-x-0 top-[2px] h-[2px] bg-neutral-500" />
                        <div className="absolute left-0 top-0 w-[6px] h-[6px] bg-neutral-400 rotate-45" />
                        <div className="absolute right-0 top-0 w-[6px] h-[6px] bg-neutral-400 rotate-45" />
                      </div>
                    ) : (
                      /* Child task: progress bar */
                      <div className="w-full h-[16px] bg-neutral-700/80 rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-red-500/90 rounded-sm transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
