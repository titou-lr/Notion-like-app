"use client";

import type { CalendarEvent } from "@/types";
import { getCategoryById, formatTime } from "@/lib/calendar-utils";

interface EventCardProps {
  event: CalendarEvent;
  style: React.CSSProperties;
  onClick: (event: CalendarEvent) => void;
}

export function EventCard({ event, style, onClick }: EventCardProps) {
  const category = getCategoryById(event.category);
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);

  return (
    <button
      onClick={() => onClick(event)}
      className="absolute left-1 right-1 rounded-xl text-left overflow-hidden transition-all duration-150 hover:brightness-110 active:scale-[0.98] min-h-[24px]"
      style={{
        ...style,
        background: category.tint,
        borderLeft: `3px solid ${category.color}`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-start gap-0.5 overflow-hidden">
        <span className="text-xs font-semibold text-white leading-tight truncate">
          {event.title}
        </span>
        {(style.height as number) > 36 && (
          <span className="text-[10px] text-white/60 leading-none">
            {formatTime(start)} – {formatTime(end)}
          </span>
        )}
      </div>
    </button>
  );
}
