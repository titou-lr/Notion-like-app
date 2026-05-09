"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, RotateCw } from "lucide-react";
import { EVENT_CATEGORIES, localDateString } from "@/lib/calendar-utils";
import type { CalendarEvent, CreateEventData } from "@/types";

interface EventModalProps {
  event?: CalendarEvent;
  initialDate: Date;
  initialHour: number;
  onClose: () => void;
  onCreate: (data: CreateEventData) => void;
  onUpdate: (id: string, data: Partial<CreateEventData>) => void;
  onDelete: (id: string) => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toTimeString(h: number, m = 0) {
  return `${pad(h)}:${pad(m)}`;
}

export function EventModal({
  event,
  initialDate,
  initialHour,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: EventModalProps) {
  const isEdit = !!event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(
    event ? localDateString(new Date(event.startAt)) : localDateString(initialDate)
  );
  const [startTime, setStartTime] = useState(
    event
      ? toTimeString(new Date(event.startAt).getHours(), new Date(event.startAt).getMinutes())
      : toTimeString(initialHour)
  );
  const [endTime, setEndTime] = useState(
    event
      ? toTimeString(new Date(event.endAt).getHours(), new Date(event.endAt).getMinutes())
      : toTimeString(Math.min(initialHour + 1, 22))
  );
  const [category, setCategory] = useState(event?.category ?? null);
  const [description, setDescription] = useState(event?.description ?? "");
  const [isRecurring, setIsRecurring] = useState(event?.isRecurring ?? false);
  const [recurrence, setRecurrence] = useState(event?.recurrence ?? "FREQ=WEEKLY");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function buildDatetimes(): { startAt: string; endAt: string } {
    return {
      startAt: new Date(`${date}T${startTime}:00`).toISOString(),
      endAt: new Date(`${date}T${endTime}:00`).toISOString(),
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { startAt, endAt } = buildDatetimes();
    const payload: CreateEventData = {
      title: title.trim(),
      startAt,
      endAt,
      category: category ?? undefined,
      description: description.trim() || undefined,
      isRecurring,
      recurrence: isRecurring ? recurrence : undefined,
    };
    if (isEdit) {
      onUpdate(event.id, payload);
    } else {
      onCreate(payload);
    }
    onClose();
  }

  function handleDelete() {
    if (!event) return;
    onDelete(event.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full sm:max-w-md glass rounded-t-3xl sm:rounded-2xl overflow-hidden"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/25" />
        </div>

        <div className="px-5 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">
              {isEdit ? "Modifier" : "Nouvel événement"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-text-secondary"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <input
              autoFocus
              type="text"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-text-disabled text-sm outline-none focus:border-white/30 transition-colors min-h-[44px]"
            />

            {/* Category */}
            <div className="flex gap-2 flex-wrap">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id === category ? null : cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 min-h-[36px]"
                  style={{
                    background: cat.id === category ? cat.tint : "rgba(255,255,255,0.06)",
                    border: `1px solid ${cat.id === category ? cat.color : "rgba(255,255,255,0.12)"}`,
                    color: cat.id === category ? cat.color : "rgba(255,255,255,0.55)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: cat.color }}
                  />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Date + Times */}
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-white/30 transition-colors min-h-[44px] [color-scheme:dark]"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-white/30 transition-colors min-h-[44px] [color-scheme:dark]"
              />
              <span className="flex items-center text-text-secondary text-sm">→</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-white/30 transition-colors min-h-[44px] [color-scheme:dark]"
              />
            </div>

            {/* Description */}
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-text-disabled text-sm outline-none focus:border-white/30 transition-colors resize-none"
            />

            {/* Recurring */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-150 min-h-[44px] ${
                  isRecurring
                    ? "bg-white/15 text-white border border-white/25"
                    : "bg-white/[0.06] text-text-secondary border border-white/12"
                }`}
              >
                <RotateCw size={15} />
                Récurrent
              </button>
              {isRecurring && (
                <div className="flex gap-2 pl-1">
                  {[
                    { label: "Quotidien", value: "FREQ=DAILY" },
                    { label: "Hebdo", value: "FREQ=WEEKLY" },
                    { label: "Mensuel", value: "FREQ=MONTHLY" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRecurrence(opt.value)}
                      className={`text-xs px-3 py-1.5 rounded-xl transition-colors min-h-[36px] ${
                        recurrence === opt.value
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-white/[0.06] text-text-secondary border border-white/12"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {isEdit && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-3 rounded-xl bg-white/[0.06] text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              )}
              {isEdit && showDeleteConfirm && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium min-h-[44px]"
                >
                  Confirmer la suppression
                </button>
              )}
              {!showDeleteConfirm && (
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-white/15 text-white border border-white/20 text-sm font-semibold hover:bg-white/20 transition-colors min-h-[44px]"
                >
                  {isEdit ? "Enregistrer" : "Créer"}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
