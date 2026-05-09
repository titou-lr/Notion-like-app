"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReminderItem } from "@/types";

interface TodayData {
  reminders: ReminderItem[];
  recentPages: { id: string; title: string; icon: string | null; updatedAt: string }[];
  events: { id: string; title: string; startAt: string; endAt: string; color: string | null }[];
}

export function useToday(initialData?: TodayData) {
  return useQuery({
    queryKey: ["today"],
    queryFn: async (): Promise<TodayData> => {
      const [remRes, pagesRes] = await Promise.all([
        fetch("/api/reminders?filter=today"),
        fetch("/api/pages"),
      ]);
      const { data: reminders } = await remRes.json();
      const { data: pages } = await pagesRes.json();
      return {
        reminders: reminders ?? [],
        recentPages: (pages ?? []).slice(0, 5),
        events: [],
      };
    },
    initialData,
  });
}
