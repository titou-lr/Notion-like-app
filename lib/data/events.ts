import { prisma } from "@/lib/prisma/client";
import type { ParsedEvent } from "@/lib/ics/parser";

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  color: string | null;
  category: string | null;
  isRecurring: boolean;
  recurrence: string | null;
  sourceLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const eventSelect = {
  id: true,
  title: true,
  description: true,
  startAt: true,
  endAt: true,
  color: true,
  category: true,
  isRecurring: true,
  recurrence: true,
  sourceLabel: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function upsertUser(supabaseUserId: string, email: string) {
  return prisma.user.upsert({
    where: { email },
    create: { id: supabaseUserId, email },
    update: {},
    select: { id: true },
  });
}

export async function getUserEvents(
  supabaseUserId: string,
  email: string,
  opts?: { from?: Date; to?: Date }
): Promise<EventRow[]> {
  const user = await upsertUser(supabaseUserId, email);

  const where: Record<string, unknown> = { userId: user.id };
  if (opts?.from || opts?.to) {
    where.startAt = {
      ...(opts?.from ? { gte: opts.from } : {}),
      ...(opts?.to ? { lte: opts.to } : {}),
    };
  }

  return prisma.event.findMany({
    where,
    select: eventSelect,
    orderBy: { startAt: "asc" },
  }) as Promise<EventRow[]>;
}

export async function createEvent(
  supabaseUserId: string,
  email: string,
  data: {
    title: string;
    description?: string;
    startAt: Date;
    endAt: Date;
    color?: string;
    category?: string;
    isRecurring?: boolean;
    recurrence?: string;
    sourceLabel?: string;
  }
): Promise<EventRow> {
  const user = await upsertUser(supabaseUserId, email);

  return prisma.event.create({
    data: { ...data, userId: user.id },
    select: eventSelect,
  }) as Promise<EventRow>;
}

export async function updateEvent(
  id: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string | null;
    startAt: Date;
    endAt: Date;
    color: string | null;
    category: string | null;
    isRecurring: boolean;
    recurrence: string | null;
  }>
): Promise<void> {
  await prisma.event.updateMany({
    where: { id, userId },
    data,
  });
}

export async function deleteEvent(id: string, userId: string): Promise<void> {
  await prisma.event.deleteMany({ where: { id, userId } });
}

export async function importEvents(
  supabaseUserId: string,
  email: string,
  events: ParsedEvent[],
  sourceLabel: string
): Promise<{ count: number }> {
  const user = await upsertUser(supabaseUserId, email);

  await prisma.event.createMany({
    data: events.map((e) => ({
      title: e.title,
      description: e.description ?? null,
      startAt: e.startAt,
      endAt: e.endAt,
      isRecurring: e.isRecurring,
      recurrence: e.recurrence ?? null,
      sourceLabel,
      userId: user.id,
    })),
  });

  return { count: events.length };
}

export async function deleteEventsBySource(
  supabaseUserId: string,
  email: string,
  sourceLabel: string
): Promise<{ count: number }> {
  const user = await upsertUser(supabaseUserId, email);

  const result = await prisma.event.deleteMany({
    where: { userId: user.id, sourceLabel },
  });

  return { count: result.count };
}
