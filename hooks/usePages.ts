"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildPageTree } from "@/lib/utils";
import type { SidebarPage } from "@/types";

export function usePages(initialData?: SidebarPage[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pages"],
    queryFn: async (): Promise<SidebarPage[]> => {
      const res = await fetch("/api/pages");
      const { data } = await res.json();
      return buildPageTree(data ?? []);
    },
    initialData,
  });

  const createPage = useMutation({
    mutationFn: async (
      parentId?: string
    ): Promise<{ id: string; title: string; icon: string | null; parentId: string | null }> => {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(parentId ? { body: JSON.stringify({ parentId }) } : {}),
      });
      const { data } = await res.json();
      return data;
    },
    onMutate: async (parentId) => {
      await queryClient.cancelQueries({ queryKey: ["pages"] });
      const previous = queryClient.getQueryData<SidebarPage[]>(["pages"]);
      const placeholder: SidebarPage = {
        id: `temp-${Date.now()}`,
        title: "Untitled",
        icon: null,
        parentId: parentId ?? null,
        children: [],
      };

      queryClient.setQueryData<SidebarPage[]>(["pages"], (old) => {
        if (!old) return [placeholder];
        if (!parentId) return [...old, placeholder];

        function insertUnder(pages: SidebarPage[]): SidebarPage[] {
          return pages.map((p) => {
            if (p.id === parentId) return { ...p, children: [...p.children, placeholder] };
            return { ...p, children: insertUnder(p.children) };
          });
        }
        return insertUnder(old);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["pages"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/pages/${id}`, { method: "DELETE" });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["pages"] });
      const previous = queryClient.getQueryData<SidebarPage[]>(["pages"]);

      function removePage(pages: SidebarPage[]): SidebarPage[] {
        return pages
          .filter((p) => p.id !== id)
          .map((p) => ({ ...p, children: removePage(p.children) }));
      }

      queryClient.setQueryData<SidebarPage[]>(["pages"], (old) =>
        old ? removePage(old) : []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["pages"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  return { query, createPage, deletePage };
}
