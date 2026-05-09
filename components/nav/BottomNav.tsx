"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Bell, CalendarDays } from "lucide-react";

const TABS = [
  {
    label: "Today",
    icon: Home,
    href: "/today",
    matches: (p: string) => p.startsWith("/today"),
  },
  {
    label: "Notes",
    icon: FileText,
    href: "/",
    matches: (p: string) =>
      p === "/" || p.startsWith("/page") || p.startsWith("/trash"),
  },
  {
    label: "Reminders",
    icon: Bell,
    href: "/reminders",
    matches: (p: string) => p.startsWith("/reminders"),
  },
  {
    label: "Calendar",
    icon: CalendarDays,
    href: "/calendar",
    matches: (p: string) => p.startsWith("/calendar"),
  },
] as const;

function useActiveTab() {
  const pathname = usePathname();
  return (matches: (p: string) => boolean) => matches(pathname);
}

/** Fixed bottom bar — mobile only (hidden on md+). */
export function BottomNav() {
  const isActive = useActiveTab();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center glass border-t border-white/10 h-16">
      {TABS.map(({ label, icon: Icon, href, matches }) => {
        const active = isActive(matches);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 flex-1 py-2 min-h-[44px] justify-center transition-all duration-150 ${
              active ? "text-white" : "text-text-disabled"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-150 ${
                active ? "bg-white/15" : ""
              }`}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.75}
              />
            </div>
            <span className="text-[10px] font-medium leading-none">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Vertical icon rail — desktop only (hidden on mobile). Rendered as a flex sibling in AppShell. */
export function NavRail() {
  const isActive = useActiveTab();

  return (
    <nav className="hidden md:flex flex-col items-center py-3 gap-1 w-14 shrink-0 m-3 mr-0 glass rounded-2xl overflow-hidden">
      {TABS.map(({ label, icon: Icon, href, matches }) => {
        const active = isActive(matches);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`flex flex-col items-center justify-center gap-0.5 w-10 h-10 rounded-xl transition-all duration-150 ${
              active
                ? "bg-white/15 text-white"
                : "text-text-disabled hover:text-text-secondary hover:bg-white/[0.08]"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
            <span className="text-[7px] font-medium leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
