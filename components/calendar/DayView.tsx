"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HOURS, HOUR_HEIGHT, TIMELINE_HEIGHT, getEventPosition, isSameDay, formatHour } from "@/lib/calendar-utils";
import { EventCard } from "./EventCard";
import type { CalendarEvent } from "@/types";

interface DayViewProps {
  date: Date;
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

export function DayView({ date, events, slideDir, onSlotTap, onEventTap }: DayViewProps) {
  const dayEvents = events.filter((e) => isSameDay(new Date(e.startAt), date));

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <AnimatePresence mode="wait" custom={slideDir}>
        <motion.div
          key={date.toDateString()}
          custom={slideDir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex"
          style={{ height: TIMELINE_HEIGHT + 32 }}
        >
          {/* Hour labels */}
          <div className="flex-shrink-0 w-14 select-none">
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

          {/* Events column */}
          <div className="flex-1 relative">
            {/* Hour grid lines */}
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-t border-white/[0.07]"
                style={{ height: HOUR_HEIGHT }}
                onClick={() => onSlotTap(date, h)}
              />
            ))}

            {/* Empty state */}
            {dayEvents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-text-disabled text-sm">
                  Aucun événement — appuyez sur un créneau pour en créer un
                </p>
              </div>
            )}

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
                  style={{ position: "absolute", top, height, left: 4, right: 4 }}
                  onClick={onEventTap}
                />
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
