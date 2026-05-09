import type { ReminderItem } from "@/types";

export function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function filterOverdue(reminders: ReminderItem[], now = new Date()): ReminderItem[] {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return reminders.filter(
    (r) => !r.isDone && r.dueAt !== null && new Date(r.dueAt) < startOfToday
  );
}

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, NORMAL: 1, LOW: 2 };

export function filterToday(reminders: ReminderItem[], now = new Date()): ReminderItem[] {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return reminders
    .filter((r) => {
      if (r.isDone || !r.dueAt) return false;
      const due = new Date(r.dueAt);
      return due >= startOfToday && due <= endOfToday;
    })
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1));
}

export function relativeTime(date: Date, now = new Date()): string {
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}
