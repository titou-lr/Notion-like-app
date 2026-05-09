"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { SearchModal } from "@/components/sidebar/SearchModal";
import { BottomNav, NavRail } from "@/components/nav/BottomNav";
import type { SidebarPage } from "@/types";

interface AppShellProps {
  pages: SidebarPage[];
  children: React.ReactNode;
}

export function AppShell({ pages, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const isNotesRoute =
    pathname === "/" ||
    pathname.startsWith("/page") ||
    pathname.startsWith("/trash");

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop: module nav rail */}
      <NavRail />

      {/* Desktop: Notes sub-sidebar — only on Notes routes */}
      {isNotesRoute && (
        <aside className="hidden md:flex w-56 shrink-0 flex-col m-3 mr-0 glass rounded-2xl overflow-hidden">
          <Sidebar pages={pages} onOpenSearch={() => setSearchOpen(true)} />
        </aside>
      )}

      {/* Mobile: hamburger — only on Notes routes */}
      {isNotesRoute && (
        <button
          className="md:hidden fixed top-3 left-3 z-50 flex items-center justify-center w-9 h-9 rounded-xl glass text-text-secondary hover:text-text-primary transition-all duration-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Mobile: search — only on Notes routes */}
      {isNotesRoute && (
        <button
          className="md:hidden fixed top-3 right-3 z-50 flex items-center justify-center w-9 h-9 rounded-xl glass text-text-secondary hover:text-text-primary transition-all duration-200"
          onClick={() => setSearchOpen(true)}
          aria-label="Search pages"
        >
          <Search size={16} />
        </button>
      )}

      {/* Mobile: Notes drawer */}
      <AnimatePresence>
        {isNotesRoute && sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              data-testid="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed left-3 top-3 bottom-3 w-72 max-w-[calc(100vw-3rem)] z-50 glass rounded-2xl flex flex-col overflow-hidden relative"
            >
              <button
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-lg text-text-disabled hover:text-text-secondary hover:bg-white/[0.08] transition-all duration-150"
              >
                <X size={14} />
              </button>
              <Sidebar
                pages={pages}
                onOpenSearch={() => {
                  setSidebarOpen(false);
                  setSearchOpen(true);
                }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main
        className={`flex-1 overflow-y-auto min-w-0 pb-16 md:pb-0 ${
          isNotesRoute ? "pt-14" : "pt-0"
        } md:pt-0`}
      >
        {children}
      </main>

      <AnimatePresence>
        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* Mobile: fixed bottom nav */}
      <BottomNav />
    </div>
  );
}
