import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface BlockWrapperProps {
  children: React.ReactNode;
  onDragHandlePointerDown: (e: React.PointerEvent) => void;
  showSaveButton: boolean;
  onSave: () => void;
  onFocusBlock: () => void;
  onBlurBlock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function GripIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="8" cy="2" r="1.5" />
      <circle cx="2" cy="7" r="1.5" />
      <circle cx="8" cy="7" r="1.5" />
      <circle cx="2" cy="12" r="1.5" />
      <circle cx="8" cy="12" r="1.5" />
    </svg>
  );
}

export function BlockWrapper({
  children,
  onDragHandlePointerDown,
  showSaveButton,
  onSave,
  onFocusBlock,
  onBlurBlock,
  onMoveUp,
  onMoveDown,
}: BlockWrapperProps) {
  const handleBlur = (e: React.FocusEvent) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
    onBlurBlock();
  };

  return (
    <div
      className="group relative flex items-start gap-1 rounded-sm border border-transparent bg-surface hover:border-border focus-within:bg-surface-hover transition-colors duration-150"
      onFocus={onFocusBlock}
      onBlur={handleBlur}
    >
      {/* Desktop: drag handle (hidden on mobile) */}
      <button
        aria-label="Drag to reorder"
        onPointerDown={onDragHandlePointerDown}
        className="hidden md:flex opacity-0 group-hover:opacity-100 mt-1 shrink-0 cursor-grab text-text-disabled transition-opacity duration-150 hover:text-text-secondary active:cursor-grabbing"
      >
        <GripIcon />
      </button>

      {/* Mobile: up/down arrows (hidden on desktop) */}
      <div className="flex md:hidden flex-col shrink-0 mt-0.5">
        <button
          aria-label="Move block up"
          onClick={onMoveUp}
          className="flex items-center justify-center w-5 h-5 text-text-disabled hover:text-text-secondary transition-colors duration-150"
        >
          <ChevronUp size={12} />
        </button>
        <button
          aria-label="Move block down"
          onClick={onMoveDown}
          className="flex items-center justify-center w-5 h-5 text-text-disabled hover:text-text-secondary transition-colors duration-150"
        >
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="relative min-w-0 flex-1 min-h-[44px]">
        {children}
        {showSaveButton && (
          <button
            aria-label="Save block"
            onMouseDown={(e) => {
              e.preventDefault(); // keeps textarea focused
              onSave();
            }}
            className="absolute top-0.5 right-0 flex items-center justify-center w-5 h-5 text-text-secondary hover:text-accent transition-colors duration-150"
          >
            <Check size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
