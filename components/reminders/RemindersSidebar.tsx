"use client";

import { useState } from "react";
import { Layers, Clock, Plus, Trash2 } from "lucide-react";
import type { ReminderListItem } from "@/types";

interface RemindersSidebarProps {
  lists: ReminderListItem[];
  selectedFilter: string;
  onSelect: (filter: string) => void;
  onNewList: (name: string) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
}

const SMART_FILTERS = [
  { id: "all", label: "All", icon: Layers },
  { id: "today", label: "Today", icon: Clock },
] as const;

export function RemindersSidebar({
  lists,
  selectedFilter,
  onSelect,
  onNewList,
  onDeleteList,
}: RemindersSidebarProps) {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || saving) return;
    setSaving(true);
    await onNewList(newListName.trim());
    setNewListName("");
    setIsAddingList(false);
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-12 px-4 shrink-0 border-b border-white/10">
        <span className="font-semibold text-sm tracking-tight text-text-primary">
          Reminders
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        {/* Smart filters */}
        {SMART_FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all duration-150 ${
              selectedFilter === id
                ? "bg-white/15 text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-white/[0.08]"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}

        {/* User lists */}
        {lists.length > 0 && (
          <div className="mx-3 my-2 border-t border-white/10" />
        )}

        {lists.map((list) => (
          <div
            key={list.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
              selectedFilter === list.id
                ? "bg-white/15 text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-white/[0.08]"
            }`}
          >
            <button
              onClick={() => onSelect(list.id)}
              className="flex-1 flex items-center gap-2.5 text-left min-w-0"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: list.color ?? "rgba(255,255,255,0.35)",
                }}
              />
              <span className="truncate">{list.name}</span>
            </button>
            <button
              onClick={() => onDeleteList(list.id)}
              aria-label={`Delete ${list.name}`}
              className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded text-text-disabled hover:text-destructive transition-all duration-150"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {/* Inline new-list form */}
        {isAddingList && (
          <form onSubmit={handleAddList} className="px-2 py-1">
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name…"
              onBlur={() => {
                if (!newListName.trim()) setIsAddingList(false);
              }}
              onKeyDown={(e) => e.key === "Escape" && setIsAddingList(false)}
              className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-1.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-white/30 transition-all"
            />
          </form>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 p-2">
        <button
          onClick={() => setIsAddingList(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-xl hover:bg-white/[0.08] transition-all duration-150"
        >
          <Plus size={14} />
          New list
        </button>
      </div>
    </div>
  );
}
