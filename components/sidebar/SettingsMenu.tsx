"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { applyWallpaper, DEFAULT_WALLPAPER_URL, WALLPAPER_STORAGE_KEY } from "@/lib/wallpaper";

interface PanelPos {
  bottom: number;
  left: number;
}

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPos>({ bottom: 0, left: 0 });
  const [inputUrl, setInputUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_WALLPAPER_URL);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(WALLPAPER_STORAGE_KEY);
    if (stored) {
      setInputUrl(stored);
      setPreviewUrl(stored);
    }
  }, []);

  const openMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
      });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const panel = document.getElementById("settings-panel");
      if (panel && !panel.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleApply = () => {
    const url = inputUrl.trim();
    if (!url) return;
    localStorage.setItem(WALLPAPER_STORAGE_KEY, url);
    setPreviewUrl(url);
    applyWallpaper(url);
  };

  const handleReset = () => {
    localStorage.removeItem(WALLPAPER_STORAGE_KEY);
    setInputUrl("");
    setPreviewUrl(DEFAULT_WALLPAPER_URL);
    applyWallpaper(null);
  };

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="settings-panel"
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: panelPos.bottom,
            left: panelPos.left,
            width: 288,
            zIndex: 9999,
          }}
          className="rounded-2xl glass p-4"
        >
          <p className="text-[0.75rem] font-semibold text-text-primary mb-3 tracking-wide uppercase opacity-60">
            Wallpaper
          </p>

          <div
            className="w-full h-24 rounded-xl mb-3 bg-black/30 bg-cover bg-center border border-white/10"
            style={{ backgroundImage: `url(${previewUrl})` }}
          />

          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
            placeholder="Paste image URL…"
            className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-white/25 transition-colors duration-150 mb-2"
          />

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex-1 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-text-primary font-medium hover:bg-white/20 transition-all duration-150"
            >
              Apply
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.08] transition-all duration-150"
            >
              Reset to default
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={buttonRef}
        aria-label="Settings"
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-disabled hover:text-text-secondary rounded-xl hover:bg-white/[0.08] transition-all duration-150"
      >
        <Settings size={12} />
        Settings
      </button>

      {mounted && createPortal(panel, document.body)}
    </>
  );
}
