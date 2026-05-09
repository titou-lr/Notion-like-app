"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { filterOverdue, filterToday } from "@/lib/today";
import { TodayReminderRow } from "./TodayReminderRow";
import { TodayNoteRow } from "./TodayNoteRow";
import { TodayEventRow } from "./TodayEventRow";
import type { ReminderItem, CalendarEvent } from "@/types";

interface RecentPage {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: string;
}

interface TodayShellProps {
  initialReminders: ReminderItem[];
  recentPages: RecentPage[];
  events: CalendarEvent[];
  greeting: string;
  formattedDate: string;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl min-h-[80px] overflow-hidden w-full">
      {children}
    </div>
  );
}

function EmptyCard({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 min-h-[80px] py-6">
      <span className="text-2xl leading-none">{icon}</span>
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}

export function TodayShell({
  initialReminders,
  recentPages,
  events,
  greeting,
  formattedDate,
}: TodayShellProps) {
  const [reminders, setReminders] = useState<ReminderItem[]>(initialReminders);

  const overdue = filterOverdue(reminders);
  const todayItems = filterToday(reminders);
  const allDue = [...overdue, ...todayItems];

  async function toggleDone(id: string, isDone: boolean) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isDone } : r))
    );
    await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone }),
    });
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full px-4 pt-6 pb-20 flex flex-col gap-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-1"
        >
          <p className="text-text-secondary text-sm font-medium">{formattedDate}</p>
          <h1 className="text-2xl font-semibold text-white mt-0.5 tracking-tight">
            {greeting}
          </h1>
        </motion.div>

        {/* 1 — Schedule */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <h2 className="text-base font-semibold text-text-primary mb-3 px-1">Schedule</h2>
          <SectionCard>
            {events.length > 0 ? (
              <div className="flex flex-col gap-0.5 p-1">
                {events.map((e) => (
                  <TodayEventRow key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <EmptyCard icon="📅" message="No events today" />
            )}
          </SectionCard>
        </motion.section>

        {/* 2 — Reminders */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <h2 className="text-base font-semibold text-text-primary mb-3 px-1">Reminders</h2>
          <SectionCard>
            {allDue.length > 0 ? (
              <div className="flex flex-col gap-1 p-1">
                {allDue.map((r) => (
                  <TodayReminderRow key={r.id} reminder={r} onToggleDone={toggleDone} />
                ))}
              </div>
            ) : (
              <EmptyCard icon="⏰" message="Nothing due today" />
            )}
          </SectionCard>
        </motion.section>

        {/* 3 — Recent notes */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <h2 className="text-base font-semibold text-text-primary mb-3 px-1">Notes</h2>
          <SectionCard>
            {recentPages.length > 0 ? (
              <div className="flex flex-col gap-1 p-1">
                {recentPages.map((page) => (
                  <TodayNoteRow
                    key={page.id}
                    id={page.id}
                    title={page.title}
                    icon={page.icon}
                    updatedAt={page.updatedAt}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard icon="📝" message="No recent notes" />
            )}
          </SectionCard>
        </motion.section>

      </div>
    </div>
  );
}
