"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, RotateCcw, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface TrashedPage {
  id: string;
  title: string;
  icon: string | null;
}

interface TrashPageClientProps {
  pages: TrashedPage[];
}

export function TrashPageClient({ pages: initialPages }: TrashPageClientProps) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);

  const handleRestore = async (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDeleted: false }),
    });
    router.refresh();
  };

  const handlePermanentDelete = async (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/pages/${id}?permanent=true`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:px-12 md:py-16">
      <h1 className="text-2xl font-semibold text-text-primary mb-1 tracking-tight">Trash</h1>
      <p className="text-sm text-text-secondary mb-8">
        Pages in trash are not visible in the sidebar.
      </p>

      {pages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Trash2 size={36} className="text-text-disabled" />
          <p className="text-text-secondary text-sm">Your trash is empty</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {pages.map((page) => (
            <motion.li
              key={page.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.06] backdrop-blur-md hover:border-white/[0.2] hover:bg-white/[0.1] transition-all duration-150"
            >
              <span className="flex-none text-lg leading-none">
                {page.icon ?? <FileText size={16} className="text-text-disabled" />}
              </span>
              <span className="flex-1 text-sm text-text-primary truncate">
                {page.title || "Untitled"}
              </span>
              <div className="flex items-center gap-1 flex-none">
                <button
                  onClick={() => handleRestore(page.id)}
                  aria-label={`restore ${page.title || "Untitled"}`}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.1] rounded-lg transition-all duration-150"
                >
                  <RotateCcw size={11} />
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(page.id)}
                  aria-label={`permanently delete ${page.title || "Untitled"}`}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-text-disabled hover:text-destructive hover:bg-white/[0.08] rounded-lg transition-all duration-150"
                >
                  <Trash2 size={11} />
                  Delete forever
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
