"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CalendarEvent } from "@/types";
import type { CalendarView } from "@/lib/calendar-utils";
import { getDateRange, navigateDate } from "@/lib/calendar-utils";

async function fetchEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
  const res = await fetch(
    `/api/events?from=${from.toISOString()}&to=${to.toISOString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch events");
  const { data } = await res.json();
  return (data ?? []) as CalendarEvent[];
}

export function eventsQueryKey(from: Date, to: Date) {
  return ["events", from.toISOString(), to.toISOString()] as const;
}

export function useEvents(from: Date, to: Date) {
  return useQuery({
    queryKey: eventsQueryKey(from, to),
    queryFn: () => fetchEvents(from, to),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePrefetchAdjacentEvents(
  view: CalendarView,
  currentDate: Date
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    ([-1, 1] as const).forEach((dir) => {
      const adj = navigateDate(view, currentDate, dir);
      const { from, to } = getDateRange(view, adj);
      queryClient.prefetchQuery({
        queryKey: eventsQueryKey(from, to),
        queryFn: () => fetchEvents(from, to),
        staleTime: 5 * 60 * 1000,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentDate.toISOString()]);
}
