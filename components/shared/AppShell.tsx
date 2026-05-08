"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import type { SidebarPage } from "@/types";

interface AppShellProps {
  pages: SidebarPage[];
  children: React.ReactNode;
}

export function AppShell({ pages, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — floating with margin */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col m-3 mr-0 glass rounded-2xl overflow-hidden">
        <Sidebar pages={pages} />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 flex items-center justify-center w-9 h-9 rounded-xl glass text-text-secondary hover:text-text-primary transition-all duration-200"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
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
              className="md:hidden fixed left-3 top-3 bottom-3 w-72 max-w-[calc(100vw-3rem)] z-50 glass rounded-2xl flex flex-col overflow-hidden"
            >
              <button
                className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-text-secondary hover:text-text-primary transition-all duration-150"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
              <Sidebar pages={pages} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
