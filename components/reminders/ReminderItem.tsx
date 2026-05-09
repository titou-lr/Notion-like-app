"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, ChevronDown } from "lucide-react";
import type { ReminderItem as ReminderItemType } from "@/types";

interface ReminderItemProps {
  reminder: ReminderItemType;
  onToggleDone: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Pick<ReminderItemType, "title" | "description">>) => void;
}

function getDueDateStyle(dueAt: string | null) {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const now = new Date();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const label = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (due < now)
    return { label, className: "text-red-400 bg-red-500/10 border border-red-400/20" };
  if (due <= todayEnd)
    return {
      label: "Today",
      className: "text-amber-400 bg-amber-500/10 border border-amber-400/20",
    };
  return { label, className: "text-text-secondary bg-white/[0.06] border border-white/10" };
}

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: "border-l-[3px] border-l-red-400/70",
  NORMAL: "border-l-[3px] border-l-amber-400/50",
  LOW: "",
};

export function ReminderItem({ reminder, onToggleDone, onDelete, onUpdate }: ReminderItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(reminder.title);
  const [localDesc, setLocalDesc] = useState(reminder.description ?? "");
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const isSwiping = useRef(false);

  const dueDateStyle = getDueDateStyle(reminder.dueAt);

  const handleTitleBlur = () => {
    setEditingTitle(false);
    const trimmed = title.trim();
    if (trimmed && trimmed !== reminder.title) {
      onUpdate(reminder.id, { title: trimmed });
    } else {
      setTitle(reminder.title);
    }
  };

  const handleDescBlur = () => {
    const trimmed = localDesc.trim() || null;
    if (trimmed !== reminder.description) {
      onUpdate(reminder.id, { description: trimmed });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartX.current;
    if (delta < -8) {
      isSwiping.current = true;
      setSwipeX(Math.max(delta, -72));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -50) {
      onDelete(reminder.id);
    } else {
      setSwipeX(0);
    }
  };

  const handleRowClick = () => {
    if (!isSwiping.current) setExpanded((v) => !v);
    isSwiping.current = false;
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Red delete layer behind (revealed on swipe) */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-16 bg-red-500/80 rounded-r-xl">
        <Trash2 size={16} className="text-white" />
      </div>

      {/* Swipeable + hoverable container */}
      <div
        className={`group relative glass rounded-xl transition-colors ${
          reminder.isDone ? "opacity-60" : ""
        } ${PRIORITY_BORDER[reminder.priority] ?? ""}`}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swipeX === 0 ? "transform 0.2s ease" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main row */}
        <div
          className="flex items-center gap-3 px-3 py-3 min-h-[52px] cursor-pointer select-none"
          onClick={handleRowClick}
        >
          {/* Checkbox */}
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

          {/* Title */}
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") {
                    setTitle(reminder.title);
                    setEditingTitle(false);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent text-sm text-text-primary outline-none"
              />
            ) : (
              <span
                className={`text-sm block truncate ${
                  reminder.isDone
                    ? "line-through text-text-disabled"
                    : "text-text-primary"
                }`}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingTitle(true);
                }}
              >
                {reminder.title}
              </span>
            )}
          </div>

          {/* Due date chip */}
          {dueDateStyle && (
            <span
              className={`shrink-0 text-[11px] px-1.5 py-0.5 rounded-lg font-medium ${dueDateStyle.className}`}
            >
              {dueDateStyle.label}
            </span>
          )}

          {/* Expand chevron */}
          <ChevronDown
            size={14}
            className={`shrink-0 text-text-disabled transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />

          {/* Desktop hover delete */}
          <button
            aria-label="Delete reminder"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(reminder.id);
            }}
            className="hidden md:flex shrink-0 items-center justify-center w-6 h-6 rounded-lg text-text-disabled hover:text-destructive hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Expanded panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="px-11 pb-3 border-t border-white/[0.08]">
                <textarea
                  placeholder="Add description…"
                  value={localDesc}
                  onChange={(e) => setLocalDesc(e.target.value)}
                  onBlur={handleDescBlur}
                  rows={2}
                  className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-disabled outline-none resize-none pt-2"
                />
                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => onDelete(reminder.id)}
                    className="flex items-center gap-1 text-xs text-destructive/60 hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
