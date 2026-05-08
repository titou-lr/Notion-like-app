"use client";

import { useEffect, useRef } from "react";

const EMOJIS = [
  // Faces
  "😀", "😂", "😍", "🤔", "😎", "🥳", "😴", "🤩", "😊", "🫡",
  // Nature
  "🌱", "🌸", "🌟", "🌊", "🔥", "⚡", "🍃", "🌙", "☀️", "🌈",
  // Food
  "🍕", "🍣", "🍎", "☕", "🍰", "🥑", "🌮", "🍜", "🍩", "🫐",
  // Activity
  "🎯", "🎨", "🎵", "🎮", "📚", "✍️", "🎤", "🎬", "🏋️", "🧘",
  // Work
  "📝", "📌", "🔑", "💡", "🔧", "💻", "📱", "🔍", "📷", "📊",
  // Symbols
  "✅", "⭐", "🚀", "💎", "🏆", "❤️", "🧠", "💯", "🎁", "🔮",
];

interface IconPickerProps {
  onSelect: (emoji: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function IconPicker({ onSelect, onClear, onClose }: IconPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 z-50 glass rounded-2xl p-3 w-72"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
    >
      <div className="grid grid-cols-10 gap-0.5 mb-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-7 h-7 flex items-center justify-center text-lg hover:bg-white/[0.12] rounded-lg transition-colors duration-75"
          >
            {emoji}
          </button>
        ))}
      </div>
      <button
        onClick={onClear}
        className="w-full px-2 py-1.5 text-xs text-text-disabled hover:text-text-secondary hover:bg-white/[0.08] rounded-xl transition-all duration-150"
      >
        Remove icon
      </button>
    </div>
  );
}
