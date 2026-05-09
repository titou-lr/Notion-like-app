export type CalendarView = "day" | "week" | "month";

export const HOUR_START = 7;
export const HOUR_END = 22;
export const HOUR_HEIGHT = 60;
export const TIMELINE_HEIGHT = (HOUR_END - HOUR_START) * HOUR_HEIGHT; // 900

export const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i + HOUR_START);

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export interface EventCategory {
  id: string;
  label: string;
  color: string;
  tint: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: "cours", label: "Cours", color: "rgba(255,80,80,0.85)", tint: "rgba(255,80,80,0.15)" },
  { id: "rdv", label: "Rendez-vous", color: "rgba(80,120,255,0.85)", tint: "rgba(80,120,255,0.15)" },
  { id: "sport", label: "Sport", color: "rgba(80,200,80,0.85)", tint: "rgba(80,200,80,0.15)" },
  { id: "perso", label: "Perso", color: "rgba(255,200,80,0.85)", tint: "rgba(255,200,80,0.15)" },
  { id: "autre", label: "Autre", color: "rgba(200,200,200,0.85)", tint: "rgba(200,200,200,0.15)" },
];

export function getCategoryById(id: string | null): EventCategory {
  return EVENT_CATEGORIES.find((c) => c.id === id) ?? EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDateRange(view: CalendarView, date: Date): { from: Date; to: Date } {
  if (view === "day") {
    return { from: startOfDay(date), to: endOfDay(date) };
  }
  if (view === "week") {
    const from = startOfWeek(date);
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  // month
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

export function navigateDate(view: CalendarView, date: Date, dir: -1 | 1): Date {
  const d = new Date(date);
  if (view === "day") {
    d.setDate(d.getDate() + dir);
  } else if (view === "week") {
    d.setDate(d.getDate() + dir * 7);
  } else {
    d.setMonth(d.getMonth() + dir);
  }
  return d;
}

export function getEventPosition(
  startAt: Date,
  endAt: Date
): { top: number; height: number } {
  const startH = startAt.getHours() + startAt.getMinutes() / 60;
  const endH = endAt.getHours() + endAt.getMinutes() / 60;
  const cStart = Math.max(startH, HOUR_START);
  const cEnd = Math.min(endH, HOUR_END);
  return {
    top: (cStart - HOUR_START) * HOUR_HEIGHT,
    height: Math.max((cEnd - cStart) * HOUR_HEIGHT, 24),
  };
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatHour(hour: number): string {
  return `${hour}:00`;
}

export function formatDayHeader(date: Date): { abbr: string; num: string } {
  return {
    abbr: date.toLocaleDateString("fr-FR", { weekday: "short" }),
    num: String(date.getDate()),
  };
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function formatDateNav(view: CalendarView, date: Date): string {
  if (view === "day") {
    return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  }
  if (view === "week") {
    const mon = startOfWeek(date);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    if (mon.getMonth() === sun.getMonth()) {
      return `${mon.getDate()} – ${sun.getDate()} ${mon.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
    }
    return `${mon.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${sun.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
  }
  return formatMonthLabel(date);
}

export function getWeekDays(date: Date): Date[] {
  const mon = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getMonthGrid(date: Date): Date[] {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const start = startOfWeek(firstDay);
  const end = new Date(lastDay);
  if (end.getDay() !== 0) end.setDate(end.getDate() + (7 - end.getDay()));

  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function localDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function localTimeString(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
