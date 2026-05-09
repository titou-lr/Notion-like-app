import { prisma } from "@/lib/prisma/client";

export type ReminderWithList = {
  id: string;
  title: string;
  description: string | null;
  dueAt: Date | null;
  priority: "LOW" | "NORMAL" | "HIGH";
  isDone: boolean;
  listId: string | null;
  list: { id: string; name: string; color: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReminderListRow = {
  id: string;
  name: string;
  color: string | null;
  createdAt: Date;
};

const reminderSelect = {
  id: true,
  title: true,
  description: true,
  dueAt: true,
  priority: true,
  isDone: true,
  listId: true,
  list: { select: { id: true, name: true, color: true } },
  createdAt: true,
  updatedAt: true,
} as const;

const listSelect = {
  id: true,
  name: true,
  color: true,
  createdAt: true,
} as const;

export function sortReminders<T extends { isDone: boolean; dueAt: Date | null }>(
  reminders: T[],
  now = new Date()
): T[] {
  return [...reminders].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;

    const aDate = a.dueAt;
    const bDate = b.dueAt;

    if (!a.isDone) {
      const aOverdue = aDate !== null && aDate < now;
      const bOverdue = bDate !== null && bDate < now;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    }

    if (aDate && bDate) return aDate.getTime() - bDate.getTime();
    if (aDate) return -1;
    if (bDate) return 1;
    return 0;
  });
}

async function upsertUser(supabaseUserId: string, email: string) {
  return prisma.user.upsert({
    where: { email },
    create: { id: supabaseUserId, email },
    update: {},
    select: { id: true },
  });
}

export async function getUserReminders(
  supabaseUserId: string,
  email: string,
  opts?: { listId?: string; todayFilter?: boolean }
): Promise<ReminderWithList[]> {
  const user = await upsertUser(supabaseUserId, email);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { userId: user.id, isDeleted: false };

  if (opts?.todayFilter) {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    where.dueAt = { lte: endOfToday };
  } else if (opts?.listId !== undefined) {
    where.listId = opts.listId;
  }

  const rows = await prisma.reminder.findMany({
    where,
    select: reminderSelect,
  });

  return sortReminders(rows as unknown as ReminderWithList[]);
}

export async function createReminder(
  supabaseUserId: string,
  email: string,
  data: {
    title: string;
    description?: string;
    dueAt?: Date;
    priority?: "LOW" | "NORMAL" | "HIGH";
    listId?: string;
  }
): Promise<ReminderWithList> {
  const user = await upsertUser(supabaseUserId, email);

  const row = await prisma.reminder.create({
    data: { userId: user.id, ...data },
    select: reminderSelect,
  });

  return row as unknown as ReminderWithList;
}

export async function updateReminder(
  id: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    dueAt?: Date | null;
    priority?: "LOW" | "NORMAL" | "HIGH";
    isDone?: boolean;
    listId?: string | null;
  }
) {
  return prisma.reminder.updateMany({
    where: { id, userId, isDeleted: false },
    data: data as Parameters<typeof prisma.reminder.updateMany>[0]["data"],
  });
}

export async function softDeleteReminder(id: string, userId: string) {
  return prisma.reminder.updateMany({
    where: { id, userId },
    data: { isDeleted: true },
  });
}

export async function getUserReminderLists(
  supabaseUserId: string,
  email: string
): Promise<ReminderListRow[]> {
  const user = await upsertUser(supabaseUserId, email);

  return prisma.reminderList.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: listSelect,
  }) as unknown as Promise<ReminderListRow[]>;
}

export async function createReminderList(
  supabaseUserId: string,
  email: string,
  data: { name: string; color?: string }
): Promise<ReminderListRow> {
  const user = await upsertUser(supabaseUserId, email);

  const row = await prisma.reminderList.create({
    data: { userId: user.id, ...data },
    select: listSelect,
  });

  return row as unknown as ReminderListRow;
}

export async function deleteReminderList(id: string, userId: string) {
  return prisma.reminderList.deleteMany({
    where: { id, userId },
  });
}
