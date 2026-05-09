"use client";

import { Plus } from "lucide-react";
import { ReminderItem } from "./ReminderItem";
import type { ReminderItem as ReminderItemType } from "@/types";

interface RemindersListProps {
  reminders: ReminderItemType[];
  loading: boolean;
  onToggleDone: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Pick<ReminderItemType, "title" | "description">>) => void;
  onNewReminder: () => void;
  filterLabel: string;
}

export function RemindersList({
  reminders,
  loading,
  onToggleDone,
  onDelete,
  onUpdate,
  onNewReminder,
  filterLabel,
}: RemindersListProps) {
  const active = reminders.filter((r) => !r.isDone);
  const done = reminders.filter((r) => r.isDone);

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 pb-6">
      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-text-primary">{filterLabel}</h1>
        <button
          onClick={onNewReminder}
          className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all duration-150"
        >
          <Plus size={14} />
          New reminder
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-text-disabled text-sm">
          Loading…
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-disabled">
          <span className="text-3xl select-none">⏰</span>
          <p className="text-sm">No reminders here</p>
          <button
            onClick={onNewReminder}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            + Add one
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {active.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggleDone={onToggleDone}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}

          {done.length > 0 && (
            <>
              <p className="px-2 pt-4 pb-1 text-xs text-text-disabled font-medium uppercase tracking-wider">
                Completed
              </p>
              {done.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onToggleDone={onToggleDone}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
