"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PageTitleProps {
  pageId: string;
  initialTitle: string;
}

export function PageTitle({ pageId, initialTitle }: PageTitleProps) {
  const [savedTitle, setSavedTitle] = useState(initialTitle || "Untitled");
  const [draft, setDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const startEditing = () => {
    setDraft(savedTitle);
    setIsEditing(true);
  };

  const save = async () => {
    const newTitle = draft.trim() || "Untitled";
    setIsEditing(false);
    if (newTitle === savedTitle) return;
    setSavedTitle(newTitle);
    await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    router.refresh();
  };

  const cancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); save(); }
          if (e.key === "Escape") cancel();
        }}
        className="text-4xl font-bold text-text-primary mb-8 tracking-tight bg-transparent outline-none w-full border-none"
        style={{ caretColor: "var(--text-primary)" }}
      />
    );
  }

  return (
    <h1
      onClick={startEditing}
      className="text-4xl font-bold text-text-primary mb-8 tracking-tight cursor-text hover:opacity-80 transition-opacity duration-150"
    >
      {savedTitle}
    </h1>
  );
}
