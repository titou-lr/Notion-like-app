"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SidebarPage } from "@/types";

interface PageTreeItemProps {
  page: SidebarPage;
  depth: number;
}

export function PageTreeItem({ page, depth }: PageTreeItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === `/page/${page.id}`;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasChildren = page.children.length > 0;

  const handleCreateChild = async () => {
    setIsCreating(true);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: page.id }),
    });
    const { data } = await res.json();
    setIsExpanded(true);
    router.push(`/page/${data.id}`);
    router.refresh();
    setIsCreating(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
    router.refresh();
    setIsDeleting(false);
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center mx-1 rounded-xl transition-all duration-150",
          isActive ? "bg-white/[0.1]" : "hover:bg-white/[0.08]"
        )}
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            aria-label={`expand ${page.title || "Untitled"}`}
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex-none flex items-center justify-center w-5 h-5 text-text-disabled hover:text-text-secondary transition-colors duration-150"
          >
            <ChevronRight
              size={12}
              className={cn(
                "transition-transform duration-150",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="flex-none w-5" />
        )}

        <Link
          href={`/page/${page.id}`}
          className={cn(
            "flex-1 flex items-center gap-1.5 px-1 py-1.5 text-[0.875rem] truncate min-w-0 transition-colors duration-150",
            isActive
              ? "text-white font-semibold"
              : "text-white/70 font-medium hover:text-white"
          )}
        >
          {page.icon && (
            <span className="flex-none text-sm leading-none">{page.icon}</span>
          )}
          <span className="truncate">{page.title || "Untitled"}</span>
        </Link>

        <div className="flex-none flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-1">
          <button
            aria-label={`delete ${page.title || "Untitled"}`}
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center w-5 h-5 text-text-disabled hover:text-destructive transition-colors duration-150 disabled:opacity-50"
          >
            <Trash2 size={11} />
          </button>
          <button
            aria-label={`add page inside ${page.title || "Untitled"}`}
            onClick={handleCreateChild}
            disabled={isCreating}
            className="flex items-center justify-center w-5 h-5 text-text-disabled hover:text-text-secondary transition-colors duration-150 disabled:opacity-50"
          >
            <span className="text-base leading-none">+</span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={page.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {page.children.map((child) => (
              <PageTreeItem key={child.id} page={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
