"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

export function EmptyState() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    const res = await fetch("/api/pages", { method: "POST" });
    const { data } = await res.json();
    router.push(`/page/${data.id}`);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="glass rounded-2xl px-10 py-12 flex flex-col items-center gap-6 text-center max-w-xs w-full">
        <FileText size={44} className="text-text-disabled" />
        <div>
          <p className="text-text-primary font-medium">No pages yet</p>
          <p className="text-text-secondary text-sm mt-1">
            Create your first page to get started.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full px-5 py-2.5 text-sm rounded-xl bg-white/[0.15] border border-white/[0.25] text-text-primary font-medium hover:bg-white/[0.25] hover:border-white/[0.35] transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] disabled:opacity-40"
        >
          {isCreating ? "Creating…" : "Create your first page"}
        </button>
      </div>
    </div>
  );
}
