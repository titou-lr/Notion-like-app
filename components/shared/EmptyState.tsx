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
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <FileText size={44} className="text-text-disabled" />
        <div>
          <p className="text-text-primary font-medium">No pages yet</p>
          <p className="text-text-secondary text-sm mt-1">
            Create your first page to get started.
          </p>
        </div>
      </div>
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="px-4 py-2 text-sm bg-accent text-background rounded-sm hover:bg-accent-muted transition-colors duration-150 disabled:opacity-50"
      >
        {isCreating ? "Creating…" : "Create your first page"}
      </button>
    </div>
  );
}
