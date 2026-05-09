"use client";

import { getCategoryById, formatTime } from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/types";

interface TodayEventRowProps {
  event: CalendarEvent;
}

export function TodayEventRow({ event }: TodayEventRowProps) {
  const cat = getCategoryById(event.category);
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/[0.04]"
      style={{ borderLeft: `3px solid ${cat.color}` }}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">{event.title}</span>
        <span className="text-xs text-text-secondary">
          {formatTime(start)} – {formatTime(end)}
        </span>
      </div>
    </div>
  );
}
