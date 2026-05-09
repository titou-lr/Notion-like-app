"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Search } from "lucide-react";
import type { SidebarPage } from "@/types";
import { PageTreeItem } from "./PageTreeItem";
import { SettingsMenu } from "./SettingsMenu";

interface SidebarProps {
  pages: SidebarPage[];
  onOpenSearch: () => void;
}

export function Sidebar({ pages, onOpenSearch }: SidebarProps) {
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
      <div className="flex items-center h-12 px-4 shrink-0 border-b border-white/10">
        <span className="font-semibold text-sm tracking-tight text-text-primary flex-1">
          Pages
        </span>
        {/* Desktop only — on mobile the search button lives in AppShell's top bar */}
        <button
          aria-label="Search pages"
          onClick={onOpenSearch}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-xl text-text-disabled hover:text-text-secondary hover:bg-white/[0.08] transition-all duration-150"
        >
          <Search size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
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

      <div className="shrink-0 border-t border-white/10 pt-2 pb-3 px-2 flex flex-col gap-1">
        <SettingsMenu />
        <Link
          href="/trash"
          className="flex items-center gap-2 px-3 py-2 text-xs text-text-disabled hover:text-text-secondary rounded-xl hover:bg-white/[0.08] transition-all duration-150"
        >
          <Trash2 size={12} />
          Trash
        </Link>
        <button
          aria-label="New page"
          disabled={isCreating}
          onClick={handleNewPage}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-xl hover:bg-white/[0.08] transition-all duration-150 disabled:opacity-40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          <span className="text-base leading-none">+</span>
          {isCreating ? "Creating…" : "New page"}
        </button>
      </div>
    </div>
  );
}
