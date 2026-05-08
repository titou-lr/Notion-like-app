"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockWrapperProps {
  children: React.ReactNode;
  onActivateDrag: (e: PointerEvent) => void;
  isLifted: boolean;
  showSaveButton: boolean;
  onSave: () => void;
  onFocusBlock: () => void;
  onBlurBlock: () => void;
}

const HOLD_DELAY_MS = 300;
const MOVE_CANCEL_PX = 8;

export function BlockWrapper({
  children,
  onActivateDrag,
  isLifted,
  showSaveButton,
  onSave,
  onFocusBlock,
  onBlurBlock,
}: BlockWrapperProps) {
  const [isPressing, setIsPressing] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const latestPos = useRef<{ x: number; y: number } | null>(null);
  const pointerId = useRef<number>(0);
  const pointerType = useRef<string>("mouse");

  const cancelHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setIsPressing(false);
    startPos.current = null;
    latestPos.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input, textarea, a, select")) return;

    startPos.current = { x: e.clientX, y: e.clientY };
    latestPos.current = { x: e.clientX, y: e.clientY };
    pointerId.current = e.pointerId;
    pointerType.current = e.pointerType;
    setIsPressing(true);

    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      setIsPressing(false);
      const pos = latestPos.current ?? startPos.current!;
      const synth = new PointerEvent("pointerdown", {
        clientX: pos.x,
        clientY: pos.y,
        bubbles: true,
        pointerId: pointerId.current,
        pointerType: pointerType.current,
      });
      onActivateDrag(synth);
    }, HOLD_DELAY_MS);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startPos.current) return;
    latestPos.current = { x: e.clientX, y: e.clientY };
    if (!holdTimer.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) cancelHold();
  };

  const handlePointerUp = () => cancelHold();

  const handleBlur = (e: React.FocusEvent) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
    onBlurBlock();
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-xl border backdrop-blur-md transition-colors duration-200 select-none",
        isLifted
          ? "border-white/[0.3] bg-white/[0.12]"
          : isPressing
          ? "border-white/[0.22] bg-white/[0.10]"
          : "border-white/[0.08] bg-white/[0.06] hover:border-white/[0.18] hover:bg-white/[0.1] focus-within:border-white/[0.22] focus-within:bg-white/[0.12]"
      )}
      animate={{
        scale: isLifted ? 1.03 : isPressing ? 1.015 : 1,
        boxShadow: isLifted
          ? "0 20px 60px rgba(0,0,0,0.55), 0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)"
          : isPressing
          ? "0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
          : "0 2px 12px rgba(0,0,0,0.15)",
      }}
      transition={
        isLifted
          ? { type: "spring", stiffness: 400, damping: 28 }
          : { type: "spring", stiffness: 350, damping: 30 }
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onFocus={onFocusBlock}
      onBlur={handleBlur}
    >
      <div className="relative min-w-0 py-3 pl-6 pr-3">
        {children}
        {showSaveButton && (
          <button
            aria-label="Save block"
            onMouseDown={(e) => {
              e.preventDefault();
              onSave();
            }}
            className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 border border-white/15 backdrop-blur-sm text-text-secondary hover:text-text-primary hover:bg-white/20 transition-all duration-150"
          >
            <Check size={12} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
