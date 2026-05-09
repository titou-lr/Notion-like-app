"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  HOURS,
  HOUR_HEIGHT,
  TIMELINE_HEIGHT,
  getEventPosition,
  isSameDay,
  isToday,
  formatHour,
  formatDayHeader,
} from "@/lib/calendar-utils";
import { EventCard } from "./EventCard";
import type { CalendarEvent } from "@/types";

interface WeekViewProps {
  weekDays: Date[];
  events: CalendarEvent[];
  slideDir: 1 | -1;
  onSlotTap: (date: Date, hour: number) => void;
  onEventTap: (event: CalendarEvent) => void;
}

const slideVariants = {
  enter: (dir: number) => ({ x: `${dir * 60}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -60}%`, opacity: 0 }),
};

export function WeekView({ weekDays, events, slideDir, onSlotTap, onEventTap }: WeekViewProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Day headers — fixed */}
      <div className="flex-shrink-0 flex border-b border-white/[0.08]">
        <div className="w-14 flex-shrink-0" />
        {weekDays.map((day) => {
          const { abbr, num } = formatDayHeader(day);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 min-w-[44px]"
            >
              <span className="text-[10px] uppercase font-medium text-text-secondary">{abbr}</span>
              <span
                className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                  today ? "bg-white text-black" : "text-text-primary"
                }`}
              >
                {num}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={weekDays[0]?.toDateString()}
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex"
            style={{ height: TIMELINE_HEIGHT + 8, minWidth: "560px" }}
          >
            {/* Hour labels */}
            <div className="w-14 flex-shrink-0 select-none">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="flex items-start justify-end pr-2"
                  style={{ height: HOUR_HEIGHT }}
                >
                  <span className="text-[11px] text-text-disabled leading-none mt-[-6px]">
                    {formatHour(h)}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayEvents = events.filter((e) => isSameDay(new Date(e.startAt), day));
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`flex-1 relative border-l border-white/[0.05] min-w-[44px] ${today ? "bg-white/[0.02]" : ""}`}
                >
                  {/* Hour slots */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="border-t border-white/[0.07]"
                      style={{ height: HOUR_HEIGHT }}
                      onClick={() => onSlotTap(day, h)}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const { top, height } = getEventPosition(
                      new Date(event.startAt),
                      new Date(event.endAt)
                    );
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        style={{ position: "absolute", top, height, left: 2, right: 2 }}
                        onClick={onEventTap}
                      />
                    );
                  })}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
