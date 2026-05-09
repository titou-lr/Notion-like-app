"use client";

import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import {
  getDateRange,
  navigateDate,
  getWeekDays,
  formatDateNav,
  isToday,
  type CalendarView,
} from "@/lib/calendar-utils";
import { useEvents, usePrefetchAdjacentEvents } from "@/hooks/useEvents";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { EventModal } from "./EventModal";
import type { CalendarEvent, CreateEventData } from "@/types";

interface ModalState {
  open: boolean;
  event?: CalendarEvent;
  initialDate?: Date;
  initialHour?: number;
}

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
];

export function CalendarShell() {
  const [view, setView] = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [modal, setModal] = useState<ModalState>({ open: false });

  const queryClient = useQueryClient();

  // Responsive default view
  useEffect(() => {
    if (window.innerWidth >= 768) setView("week");
  }, []);

  const { from, to } = getDateRange(view, currentDate);
  const { data: events = [] } = useEvents(from, to);
  usePrefetchAdjacentEvents(view, currentDate);

  function navigate(dir: -1 | 1) {
    setSlideDir(dir);
    setCurrentDate((prev) => navigateDate(view, prev, dir));
  }

  function goToToday() {
    const today = new Date();
    setSlideDir(today > currentDate ? 1 : -1);
    setCurrentDate(today);
  }

  function openCreate(date: Date, hour: number) {
    setModal({ open: true, initialDate: date, initialHour: hour });
  }

  function openEdit(event: CalendarEvent) {
    setModal({ open: true, event });
  }

  function closeModal() {
    setModal({ open: false });
  }

  const createMutation = useMutation({
    mutationFn: async (data: CreateEventData) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      const { data: event } = await res.json();
      return event as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateEventData>) => {
      await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const weekDays = view === "week" ? getWeekDays(currentDate) : [];
  const notToday = !isToday(currentDate);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-3 pt-4 pb-3 flex flex-col gap-3">
        {/* View switcher */}
        <div className="flex gap-1 glass rounded-xl p-1 self-center">
          {VIEWS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[36px] ${
                view === id
                  ? "bg-white/20 text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Navigation row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-semibold text-text-primary capitalize">
              {formatDateNav(view, currentDate)}
            </span>
            {notToday && (
              <button
                onClick={goToToday}
                className="text-[11px] text-text-disabled hover:text-text-secondary transition-colors"
              >
                Aujourd&apos;hui
              </button>
            )}
          </div>

          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* View */}
      <div className="flex-1 overflow-hidden">
        {view === "day" && (
          <DayView
            date={currentDate}
            events={events}
            slideDir={slideDir}
            onSlotTap={openCreate}
            onEventTap={openEdit}
          />
        )}
        {view === "week" && (
          <WeekView
            weekDays={weekDays}
            events={events}
            slideDir={slideDir}
            onSlotTap={openCreate}
            onEventTap={openEdit}
          />
        )}
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            events={events}
            slideDir={slideDir}
            onDayTap={(date) => {
              setCurrentDate(date);
              setView("day");
            }}
            onEventTap={openEdit}
          />
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <EventModal
            event={modal.event}
            initialDate={modal.initialDate ?? currentDate}
            initialHour={modal.initialHour ?? 9}
            onClose={closeModal}
            onCreate={(data) => createMutation.mutate(data)}
            onUpdate={(id, data) => updateMutation.mutate({ id, ...data })}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
