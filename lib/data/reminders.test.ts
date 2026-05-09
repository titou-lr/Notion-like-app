import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    user: { upsert: vi.fn() },
    reminder: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    reminderList: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { sortReminders, getUserReminders, createReminder, updateReminder, softDeleteReminder, getUserReminderLists, createReminderList, deleteReminderList } from "./reminders";
import { prisma } from "@/lib/prisma/client";

// ─── sortReminders ────────────────────────────────────────────────────────────

const make = (overrides: { isDone?: boolean; dueAt?: Date | null } = {}) => ({
  isDone: false,
  dueAt: null,
  ...overrides,
});

const NOW = new Date("2024-01-15T12:00:00Z");
const PAST = new Date("2024-01-10T00:00:00Z");
const FUTURE = new Date("2024-01-20T00:00:00Z");

describe("sortReminders", () => {
  it("puts done items after non-done items", () => {
    const input = [make({ isDone: true }), make({ isDone: false })];
    const result = sortReminders(input, NOW);
    expect(result[0].isDone).toBe(false);
    expect(result[1].isDone).toBe(true);
  });

  it("puts overdue items before future items (among non-done)", () => {
    const input = [make({ dueAt: FUTURE }), make({ dueAt: PAST })];
    const result = sortReminders(input, NOW);
    expect(result[0].dueAt).toEqual(PAST);
    expect(result[1].dueAt).toEqual(FUTURE);
  });

  it("sorts non-overdue items ascending by dueAt", () => {
    const d1 = new Date("2024-01-20T00:00:00Z");
    const d2 = new Date("2024-01-25T00:00:00Z");
    const d3 = new Date("2024-01-18T00:00:00Z");
    const result = sortReminders([make({ dueAt: d1 }), make({ dueAt: d2 }), make({ dueAt: d3 })], NOW);
    expect(result.map((r) => r.dueAt)).toEqual([d3, d1, d2]);
  });

  it("puts reminders without dueAt after those with a future dueAt", () => {
    const result = sortReminders([make({ dueAt: null }), make({ dueAt: FUTURE })], NOW);
    expect(result[0].dueAt).toEqual(FUTURE);
    expect(result[1].dueAt).toBeNull();
  });

  it("full order: overdue → future → no-date → done", () => {
    const input = [
      make({ isDone: true, dueAt: PAST }),
      make({ dueAt: null }),
      make({ dueAt: FUTURE }),
      make({ dueAt: PAST }),
    ];
    const result = sortReminders(input, NOW);
    expect(result[0]).toEqual(make({ dueAt: PAST }));
    expect(result[1]).toEqual(make({ dueAt: FUTURE }));
    expect(result[2]).toEqual(make({ dueAt: null }));
    expect(result[3]).toEqual(make({ isDone: true, dueAt: PAST }));
  });

  it("does not mutate the input array", () => {
    const input = [make({ isDone: true }), make({ isDone: false })];
    const copy = [...input];
    sortReminders(input, NOW);
    expect(input).toEqual(copy);
  });
});

// ─── getUserReminders ─────────────────────────────────────────────────────────

describe("getUserReminders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upserts user and returns sorted reminders", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.reminder.findMany).mockResolvedValue([
      { id: "r1", isDone: false, dueAt: PAST, title: "A", description: null, priority: "NORMAL", listId: null, list: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "r2", isDone: false, dueAt: FUTURE, title: "B", description: null, priority: "NORMAL", listId: null, list: null, createdAt: new Date(), updatedAt: new Date() },
    ] as never);

    const result = await getUserReminders("supa-1", "a@b.com");
    expect(prisma.user.upsert).toHaveBeenCalled();
    expect(result[0].id).toBe("r1"); // overdue first
  });

  it("filters by listId when provided", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.reminder.findMany).mockResolvedValue([] as never);

    await getUserReminders("supa-1", "a@b.com", { listId: "list-1" });

    expect(prisma.reminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ listId: "list-1" }) })
    );
  });

  it("applies dueAt lte filter for todayFilter", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.reminder.findMany).mockResolvedValue([] as never);

    await getUserReminders("supa-1", "a@b.com", { todayFilter: true });

    expect(prisma.reminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ dueAt: expect.objectContaining({ lte: expect.any(Date) }) }) })
    );
  });
});

// ─── createReminder ───────────────────────────────────────────────────────────

describe("createReminder", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upserts user and creates a reminder", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.reminder.create).mockResolvedValue({ id: "rem-1", title: "Buy milk" } as never);

    const result = await createReminder("supa-1", "a@b.com", { title: "Buy milk" });

    expect(prisma.reminder.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1", title: "Buy milk" }) })
    );
    expect(result).toMatchObject({ id: "rem-1", title: "Buy milk" });
  });
});

// ─── updateReminder ───────────────────────────────────────────────────────────

describe("updateReminder", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates only the given fields, scoped to user + not-deleted", async () => {
    vi.mocked(prisma.reminder.updateMany).mockResolvedValue({ count: 1 } as never);

    await updateReminder("rem-1", "user-1", { isDone: true });

    expect(prisma.reminder.updateMany).toHaveBeenCalledWith({
      where: { id: "rem-1", userId: "user-1", isDeleted: false },
      data: { isDone: true },
    });
  });
});

// ─── softDeleteReminder ───────────────────────────────────────────────────────

describe("softDeleteReminder", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets isDeleted to true", async () => {
    vi.mocked(prisma.reminder.updateMany).mockResolvedValue({ count: 1 } as never);

    await softDeleteReminder("rem-1", "user-1");

    expect(prisma.reminder.updateMany).toHaveBeenCalledWith({
      where: { id: "rem-1", userId: "user-1" },
      data: { isDeleted: true },
    });
  });
});

// ─── getUserReminderLists ─────────────────────────────────────────────────────

describe("getUserReminderLists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns lists for the user ordered by createdAt asc", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.reminderList.findMany).mockResolvedValue([
      { id: "l1", name: "Work", color: "#0ea5e9", createdAt: new Date() },
    ] as never);

    const result = await getUserReminderLists("supa-1", "a@b.com");

    expect(prisma.reminderList.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, color: true, createdAt: true },
    });
    expect(result[0].name).toBe("Work");
  });
});

// ─── createReminderList ───────────────────────────────────────────────────────

describe("createReminderList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a list scoped to the user", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.reminderList.create).mockResolvedValue({ id: "l-1", name: "Personal", color: null, createdAt: new Date() } as never);

    await createReminderList("supa-1", "a@b.com", { name: "Personal" });

    expect(prisma.reminderList.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1", name: "Personal" }) })
    );
  });
});

// ─── deleteReminderList ───────────────────────────────────────────────────────

describe("deleteReminderList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the list scoped to the user", async () => {
    vi.mocked(prisma.reminderList.deleteMany).mockResolvedValue({ count: 1 } as never);

    await deleteReminderList("l-1", "user-1");

    expect(prisma.reminderList.deleteMany).toHaveBeenCalledWith({
      where: { id: "l-1", userId: "user-1" },
    });
  });
});
