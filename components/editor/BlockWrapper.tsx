interface BlockWrapperProps {
  children: React.ReactNode;
  onDragHandlePointerDown: (e: React.PointerEvent) => void;
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

export function BlockWrapper({ children, onDragHandlePointerDown }: BlockWrapperProps) {
  return (
    <div className="group relative flex items-start gap-1">
      <button
        aria-label="Drag to reorder"
        onPointerDown={onDragHandlePointerDown}
        className="opacity-0 group-hover:opacity-100 mt-1 shrink-0 cursor-grab text-text-disabled transition-opacity duration-150 hover:text-text-secondary active:cursor-grabbing"
      >
        <GripIcon />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
