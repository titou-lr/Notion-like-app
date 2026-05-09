"use client";

import type { ReminderItem } from "@/types";
import { useRouter } from "next/navigation";

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: "border-l-[3px] border-l-red-400/70",
  NORMAL: "border-l-[3px] border-l-amber-400/50",
  LOW: "",
};

interface TodayReminderRowProps {
  reminder: ReminderItem;
  onToggleDone: (id: string, isDone: boolean) => void;
}

export function TodayReminderRow({ reminder, onToggleDone }: TodayReminderRowProps) {
  const router = useRouter();

  return (
    <div
      className={`glass rounded-xl flex items-center gap-3 px-3 py-3 min-h-[52px] cursor-pointer transition-colors hover:bg-white/[0.05] ${
        PRIORITY_BORDER[reminder.priority] ?? ""
      } ${reminder.isDone ? "opacity-60" : ""}`}
      onClick={() => router.push("/reminders")}
    >
      <button
        aria-label={reminder.isDone ? "Mark as not done" : "Mark as done"}
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone(reminder.id, !reminder.isDone);
        }}
        className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 hover:scale-110"
        style={{
          borderColor: reminder.isDone
            ? "rgba(0, 204, 136, 0.7)"
            : "rgba(255,255,255,0.3)",
          backgroundColor: reminder.isDone
            ? "rgba(0, 204, 136, 0.15)"
            : "transparent",
        }}
      >
        {reminder.isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="rgba(0,204,136,0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span
        className={`text-sm flex-1 min-w-0 truncate ${
          reminder.isDone ? "line-through text-text-disabled" : "text-text-primary"
        }`}
      >
        {reminder.title}
      </span>

      {reminder.list && (
        <span
          className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-lg font-medium text-text-secondary bg-white/[0.06] border border-white/10"
          style={
            reminder.list.color
              ? { borderColor: `${reminder.list.color}40`, color: reminder.list.color }
              : undefined
          }
        >
          {reminder.list.name}
        </span>
      )}
    </div>
  );
}
