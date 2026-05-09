"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Priority, ReminderListItem, CreateReminderData } from "@/types";

interface NewReminderModalProps {
  lists: ReminderListItem[];
  onClose: () => void;
  onCreate: (data: CreateReminderData) => Promise<void>;
}

const PRIORITIES: { value: Priority; label: string; activeClass: string }[] = [
  { value: "LOW", label: "Low", activeClass: "bg-white/10 text-text-secondary border-white/25" },
  { value: "NORMAL", label: "Normal", activeClass: "bg-amber-500/20 text-amber-400 border-amber-400/30" },
  { value: "HIGH", label: "High", activeClass: "bg-red-500/20 text-red-400 border-red-400/30" },
];

export function NewReminderModal({ lists, onClose, onCreate }: NewReminderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [listId, setListId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);

    const dueAtISO = dueAt ? new Date(dueAt).toISOString() : undefined;

    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      dueAt: dueAtISO,
      priority,
      listId: listId || undefined,
    });

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        key="modal-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full md:max-w-md glass rounded-t-2xl md:rounded-2xl p-5 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">New reminder</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-text-disabled hover:text-text-secondary hover:bg-white/[0.08] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title */}
          <input
            autoFocus
            required
            placeholder="Reminder title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-white/30 transition-all"
          />

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-white/30 transition-all resize-none"
          />

          {/* Due date */}
          <div>
            <label className="block text-xs text-text-disabled mb-1.5">Due date</label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-white/30 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs text-text-disabled mb-1.5">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(({ value, label, activeClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-150 ${
                    priority === value
                      ? activeClass
                      : "bg-white/[0.05] text-text-disabled border-white/10 hover:border-white/20 hover:text-text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* List selector */}
          {lists.length > 0 && (
            <div>
              <label className="block text-xs text-text-disabled mb-1.5">List</label>
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-white/30 transition-all [color-scheme:dark]"
              >
                <option value="">No list</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.08] border border-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/15 text-white hover:bg-white/20 border border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Add reminder"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
