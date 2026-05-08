"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { SidebarPage } from "@/types";
import { PageTreeItem } from "./PageTreeItem";

interface SidebarProps {
  pages: SidebarPage[];
}

export function Sidebar({ pages }: SidebarProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleNewPage = async () => {
    setIsCreating(true);
    const res = await fetch("/api/pages", { method: "POST" });
    const { data } = await res.json();
    router.push(`/page/${data.id}`);
    router.refresh();
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-11 px-3 shrink-0">
        <span className="font-semibold text-sm tracking-tight text-text-primary">
          Notion
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {pages.length === 0 ? (
          <p className="px-3 py-2 text-xs text-text-disabled">No pages yet</p>
        ) : (
          <nav>
            {pages.map((page) => (
              <PageTreeItem key={page.id} page={page} depth={0} />
            ))}
          </nav>
        )}
      </div>

      <div className="shrink-0 border-t border-border pt-1 pb-2 px-2 flex flex-col gap-0.5">
        <Link
          href="/trash"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-disabled hover:text-text-secondary hover:bg-surface-hover rounded-sm transition-colors duration-150"
        >
          <Trash2 size={12} />
          Trash
        </Link>
        <button
          aria-label="New page"
          disabled={isCreating}
          onClick={handleNewPage}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-sm transition-colors duration-150 disabled:opacity-50"
        >
          <span className="text-base leading-none">+</span>
          {isCreating ? "Creating…" : "New page"}
        </button>
      </div>
    </div>
  );
}
