"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { IconPicker } from "./IconPicker";

interface PageIconProps {
  pageId: string;
  initialIcon: string | null;
}

export function PageIcon({ pageId, initialIcon }: PageIconProps) {
  const router = useRouter();
  const [icon, setIcon] = useState(initialIcon);
  const [pickerOpen, setPickerOpen] = useState(false);

  const save = async (newIcon: string | null) => {
    setIcon(newIcon);
    setPickerOpen(false);
    await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon: newIcon }),
    });
    router.refresh();
  };

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setPickerOpen((prev) => !prev)}
        aria-label="Set page icon"
        className="group flex items-center justify-center w-16 h-16 rounded-lg hover:bg-surface-hover transition-colors duration-150"
      >
        {icon ? (
          <span className="text-5xl leading-none select-none">{icon}</span>
        ) : (
          <FileText
            size={36}
            className="text-text-disabled group-hover:text-text-secondary transition-colors duration-150"
          />
        )}
      </button>

      {pickerOpen && (
        <IconPicker
          onSelect={(emoji) => save(emoji)}
          onClear={() => save(null)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
