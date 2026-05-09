"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReminderItem, CreateReminderData } from "@/types";

function buildQs(filter: string): string {
  if (filter === "today") return "filter=today";
  if (filter !== "all") return `listId=${filter}`;
  return "";
}

export function useReminders(filter: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["reminders", filter],
    queryFn: async (): Promise<ReminderItem[]> => {
      const qs = buildQs(filter);
      const res = await fetch(`/api/reminders${qs ? `?${qs}` : ""}`);
      const { data } = await res.json();
      return data ?? [];
    },
  });

  const toggleDone = useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone }),
      });
    },
    onMutate: async ({ id, isDone }) => {
      await queryClient.cancelQueries({ queryKey: ["reminders", filter] });
      const previous = queryClient.getQueryData<ReminderItem[]>(["reminders", filter]);
      queryClient.setQueryData<ReminderItem[]>(["reminders", filter], (old) =>
        old?.map((r) => (r.id === id ? { ...r, isDone } : r)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["reminders", filter], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", filter] });
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["reminders", filter] });
      const previous = queryClient.getQueryData<ReminderItem[]>(["reminders", filter]);
      queryClient.setQueryData<ReminderItem[]>(["reminders", filter], (old) =>
        old?.filter((r) => r.id !== id) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["reminders", filter], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", filter] });
    },
  });

  const createReminder = useMutation({
    mutationFn: async (data: CreateReminderData): Promise<ReminderItem> => {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const { data: created } = await res.json();
      return created;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["reminders", filter] });
      const previous = queryClient.getQueryData<ReminderItem[]>(["reminders", filter]);
      const optimistic: ReminderItem = {
        id: `temp-${Date.now()}`,
        title: data.title,
        description: data.description ?? null,
        dueAt: data.dueAt ?? null,
        priority: data.priority ?? "NORMAL",
        isDone: false,
        listId: data.listId ?? null,
        list: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<ReminderItem[]>(["reminders", filter], (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["reminders", filter], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", filter] });
    },
  });

  const updateReminder = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & Partial<Pick<ReminderItem, "title" | "description">>) => {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ["reminders", filter] });
      const previous = queryClient.getQueryData<ReminderItem[]>(["reminders", filter]);
      queryClient.setQueryData<ReminderItem[]>(["reminders", filter], (old) =>
        old?.map((r) => (r.id === id ? { ...r, ...data } : r)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["reminders", filter], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", filter] });
    },
  });

  return { query, toggleDone, deleteReminder, createReminder, updateReminder };
}
