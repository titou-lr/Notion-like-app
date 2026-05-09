"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Plus, X } from "lucide-react";
import { RemindersSidebar } from "./RemindersSidebar";
import { RemindersList } from "./RemindersList";
import { NewReminderModal } from "./NewReminderModal";
import { useReminders } from "@/hooks/useReminders";
import type { ReminderListItem, CreateReminderData } from "@/types";

interface RemindersShellProps {
  initialLists: ReminderListItem[];
}

export function RemindersShell({ initialLists }: RemindersShellProps) {
  const [lists, setLists] = useState<ReminderListItem[]>(initialLists);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { query, toggleDone, deleteReminder, createReminder, updateReminder } =
    useReminders(selectedFilter);

  const reminders = query.data ?? [];
  const loading = query.isLoading;

  const handleToggleDone = (id: string, isDone: boolean) => {
    toggleDone.mutate({ id, isDone });
  };

  const handleDelete = (id: string) => {
    deleteReminder.mutate(id);
  };

  const handleUpdate = (
    id: string,
    data: Partial<Pick<(typeof reminders)[0], "title" | "description">>
  ) => {
    updateReminder.mutate({ id, ...data });
  };

  const handleCreate = async (data: CreateReminderData) => {
    await createReminder.mutateAsync(data);
  };

  const handleNewList = async (name: string) => {
    const res = await fetch("/api/reminder-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const { data } = await res.json();
    if (data) {
      setLists((prev) => [
        ...prev,
        { ...data, createdAt: data.createdAt ?? new Date().toISOString() },
      ]);
    }
  };

  const handleDeleteList = async (id: string) => {
    await fetch(`/api/reminder-lists/${id}`, { method: "DELETE" });
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (selectedFilter === id) setSelectedFilter("all");
  };

  const filterLabel =
    selectedFilter === "all"
      ? "All"
      : selectedFilter === "today"
      ? "Today"
      : (lists.find((l) => l.id === selectedFilter)?.name ?? "Reminders");

  const sidebarProps = {
    lists,
    selectedFilter,
    onSelect: (f: string) => {
      setSelectedFilter(f);
      setSidebarOpen(false);
    },
    onNewList: handleNewList,
    onDeleteList: handleDeleteList,
  };

  return (
    <div className="flex h-full">
      {/* Desktop: reminders sub-sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col m-3 mr-0 glass rounded-2xl overflow-hidden">
        <RemindersSidebar {...sidebarProps} />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 pt-3 pb-1 h-14 shrink-0">
          <button
            aria-label="Open reminders menu"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl glass text-text-secondary hover:text-text-primary transition-all"
          >
            <Menu size={18} />
          </button>
          <h1 className="flex-1 font-semibold text-text-primary truncate">
            {filterLabel}
          </h1>
          <button
            aria-label="New reminder"
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl glass text-text-secondary hover:text-text-primary transition-all"
          >
            <Plus size={18} />
          </button>
        </div>

        <RemindersList
          reminders={reminders}
          loading={loading}
          onToggleDone={handleToggleDone}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onNewReminder={() => setShowModal(true)}
          filterLabel={filterLabel}
        />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="rem-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="rem-drawer"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed left-3 top-3 bottom-3 w-72 max-w-[calc(100vw-3rem)] z-50 glass rounded-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center h-12 px-4 shrink-0 border-b border-white/10">
                <span className="font-semibold text-sm text-text-primary flex-1">
                  Reminders
                </span>
                <button
                  aria-label="Close reminders menu"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-text-disabled hover:text-text-secondary hover:bg-white/[0.08] transition-all"
                >
                  <X size={14} />
                </button>
              </div>
              <RemindersSidebar {...sidebarProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* New reminder modal */}
      <AnimatePresence>
        {showModal && (
          <NewReminderModal
            lists={lists}
            onClose={() => setShowModal(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
