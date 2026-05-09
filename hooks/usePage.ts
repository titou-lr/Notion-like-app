"use client";

import { useQuery } from "@tanstack/react-query";
import type { Block } from "@/types";

interface PageData {
  id: string;
  title: string;
  icon: string | null;
  blocks: Block[];
}

export function usePage(pageId: string, initialData?: PageData) {
  return useQuery({
    queryKey: ["page", pageId],
    queryFn: async (): Promise<PageData> => {
      const res = await fetch(`/api/pages/${pageId}`);
      const { data } = await res.json();
      return data;
    },
    initialData,
    enabled: !!pageId,
  });
}
