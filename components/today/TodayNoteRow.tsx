"use client";

import Link from "next/link";
import { relativeTime } from "@/lib/today";
import { FileText } from "lucide-react";

interface TodayNoteRowProps {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: string;
}

export function TodayNoteRow({ id, title, icon, updatedAt }: TodayNoteRowProps) {
  const ago = relativeTime(new Date(updatedAt));

  return (
    <Link
      href={`/page/${id}`}
      className="glass rounded-xl flex items-center gap-3 px-3 py-3 min-h-[52px] transition-colors hover:bg-white/[0.05] group"
    >
      <span className="shrink-0 text-lg leading-none w-6 text-center">
        {icon ?? <FileText size={16} className="text-text-disabled" />}
      </span>

      <span className="flex-1 min-w-0 text-sm text-text-primary truncate group-hover:text-white transition-colors">
        {title || "Untitled"}
      </span>

      <span className="shrink-0 text-[11px] text-text-disabled">{ago}</span>
    </Link>
  );
}
