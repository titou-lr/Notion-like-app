"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  getMonthGrid,
  isSameDay,
  isToday,
  WEEKDAY_LABELS,
  getCategoryById,
} from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/types";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  slideDir: 1 | -1;
  onDayTap: (date: Date) => void;
  onEventTap: (event: CalendarEvent) => void;
}

const slideVariants = {
  enter: (dir: number) => ({ x: `${dir * 40}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -40}%`, opacity: 0 }),
};

const MAX_PILLS = 3;

export function MonthView({ currentDate, events, slideDir, onDayTap, onEventTap }: MonthViewProps) {
  const grid = getMonthGrid(currentDate);
  const isCurrentMonth = (d: Date) => d.getMonth() === currentDate.getMonth();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Weekday headers */}
      <div className="flex-shrink-0 grid grid-cols-7 border-b border-white/[0.08] py-1">
        {WEEKDAY_LABELS.map((l) => (
          <div key={l} className="text-center text-[11px] font-medium text-text-disabled py-1">
            {l}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="grid grid-cols-7 h-full"
            style={{ minHeight: Math.ceil(grid.length / 7) * 80 }}
          >
            {grid.map((day) => {
              const dayEvents = events.filter((e) =>
                isSameDay(new Date(e.startAt), day)
              );
              const today = isToday(day);
              const inMonth = isCurrentMonth(day);
              const visible = dayEvents.slice(0, MAX_PILLS);
              const overflow = dayEvents.length - MAX_PILLS;

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] border-t border-l border-white/[0.06] p-1 cursor-pointer transition-colors hover:bg-white/[0.04] ${
                    !inMonth ? "opacity-40" : ""
                  }`}
                  onClick={() => onDayTap(day)}
                >
                  {/* Day number */}
                  <div className="flex justify-center mb-1">
                    <span
                      className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        today ? "bg-white text-black font-semibold" : "text-text-primary"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Event pills */}
                  <div className="flex flex-col gap-0.5">
                    {visible.map((event) => {
                      const cat = getCategoryById(event.category);
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventTap(event);
                          }}
                          className="w-full text-left px-1.5 py-0.5 rounded-md text-[10px] truncate leading-tight min-h-[18px]"
                          style={{
                            background: cat.tint,
                            color: cat.color,
                            borderLeft: `2px solid ${cat.color}`,
                          }}
                        >
                          {event.title}
                        </button>
                      );
                    })}
                    {overflow > 0 && (
                      <span className="text-[10px] text-text-disabled px-1">
                        +{overflow} autre{overflow > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
