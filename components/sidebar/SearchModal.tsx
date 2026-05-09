"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types";

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setActiveIndex(0);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        setResults(json.data ?? []);
        setActiveIndex(0);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Scroll active result into view
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const navigate = (result: SearchResult) => {
    router.push(`/page/${result.pageId}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { onClose(); return; }
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(results[activeIndex]);
    }
  };

  const showEmpty = query.trim().length >= 2 && !isLoading && results.length === 0;
  const showHint = query.trim().length < 2;

  const modal = (
    <AnimatePresence>
      <motion.div
        key="search-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 md:bg-black/50 md:backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Panel: full-screen on mobile, centered 480px on desktop */}
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] glass rounded-none md:rounded-2xl flex flex-col overflow-hidden"
          style={{ zIndex: 9999 }}
          role="dialog"
          aria-label="Search pages"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 shrink-0">
            {isLoading ? (
              <Loader2 size={15} className="text-text-disabled flex-none animate-spin" />
            ) : (
              <Search size={15} className="text-text-disabled flex-none" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages and content…"
              aria-label="Search query"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-activedescendant={
                results.length > 0 ? `search-result-${activeIndex}` : undefined
              }
              className="flex-1 min-w-0 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-disabled"
            />
            {/* Cancel — mobile only */}
            <button
              onClick={onClose}
              className="md:hidden text-xs text-text-secondary hover:text-text-primary transition-colors duration-150 shrink-0 px-1"
            >
              Cancel
            </button>
            {/* Esc hint — desktop only */}
            <kbd className="hidden md:flex items-center px-1.5 py-0.5 text-[10px] text-text-disabled border border-white/15 rounded-md font-mono leading-none shrink-0">
              Esc
            </kbd>
          </div>

          {/* Results list */}
          <div
            ref={listRef}
            id="search-results"
            role="listbox"
            aria-label="Search results"
            className="flex-1 overflow-y-auto py-1.5 md:max-h-[400px]"
          >
            {results.map((result, i) => (
              <button
                key={result.pageId}
                id={`search-result-${i}`}
                data-index={i}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => navigate(result)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors duration-100",
                  i === activeIndex ? "bg-white/[0.12]" : "hover:bg-white/[0.08]"
                )}
              >
                <div className="flex-none w-5 h-5 flex items-center justify-center mt-0.5">
                  {result.pageIcon ? (
                    <span className="text-base leading-none">{result.pageIcon}</span>
                  ) : (
                    <FileText size={14} className="text-text-disabled" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate leading-snug">
                    {result.pageTitle || "Untitled"}
                  </p>
                  {result.excerpt && (
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed break-words">
                      {result.excerpt}
                    </p>
                  )}
                </div>
              </button>
            ))}

            {showEmpty && (
              <p className="px-4 py-8 text-sm text-text-disabled text-center">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {showHint && (
              <p className="px-4 py-8 text-xs text-text-disabled text-center">
                Type at least 2 characters to search
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
