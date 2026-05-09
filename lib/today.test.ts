import { describe, it, expect } from "vitest";
import { getGreeting, filterOverdue, filterToday, relativeTime } from "./today";
import type { ReminderItem } from "@/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const NOW = new Date("2024-06-15T14:00:00.000Z"); // Saturday 14:00 UTC

function makeReminder(overrides: Partial<ReminderItem> = {}): ReminderItem {
  return {
    id: "r1",
    title: "Test",
    description: null,
    dueAt: null,
    priority: "NORMAL",
    isDone: false,
    listId: null,
    list: null,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

// Use a fixed local-time reference so tests are timezone-independent:
// "today" is 2024-06-15. Overdue = 2024-06-14. Future = 2024-06-16.
const LOCAL_NOW = new Date(2024, 5, 15, 14, 0, 0); // June 15, 14:00 local

const LOCAL_OVERDUE = new Date(2024, 5, 14, 10, 0, 0).toISOString(); // Jun 14
const LOCAL_TODAY_MORNING = new Date(2024, 5, 15, 8, 0, 0).toISOString(); // Jun 15 08:00
const LOCAL_TODAY_EVENING = new Date(2024, 5, 15, 20, 0, 0).toISOString(); // Jun 15 20:00
const LOCAL_FUTURE = new Date(2024, 5, 16, 9, 0, 0).toISOString(); // Jun 16

// ─── getGreeting ─────────────────────────────────────────────────────────────

describe("getGreeting", () => {
  it("returns 'Good morning' before noon", () => {
    expect(getGreeting(new Date(2024, 5, 15, 0, 0))).toBe("Good morning");
    expect(getGreeting(new Date(2024, 5, 15, 11, 59))).toBe("Good morning");
  });

  it("returns 'Good afternoon' from noon to 17:59", () => {
    expect(getGreeting(new Date(2024, 5, 15, 12, 0))).toBe("Good afternoon");
    expect(getGreeting(new Date(2024, 5, 15, 17, 59))).toBe("Good afternoon");
  });

  it("returns 'Good evening' from 18:00 onwards", () => {
    expect(getGreeting(new Date(2024, 5, 15, 18, 0))).toBe("Good evening");
    expect(getGreeting(new Date(2024, 5, 15, 23, 59))).toBe("Good evening");
  });
});

// ─── filterOverdue ────────────────────────────────────────────────────────────

describe("filterOverdue", () => {
  it("includes reminders with dueAt before start of today", () => {
    const r = makeReminder({ dueAt: LOCAL_OVERDUE });
    expect(filterOverdue([r], LOCAL_NOW)).toHaveLength(1);
  });

  it("excludes reminders due today", () => {
    const r = makeReminder({ dueAt: LOCAL_TODAY_MORNING });
    expect(filterOverdue([r], LOCAL_NOW)).toHaveLength(0);
  });

  it("excludes reminders due in the future", () => {
    const r = makeReminder({ dueAt: LOCAL_FUTURE });
    expect(filterOverdue([r], LOCAL_NOW)).toHaveLength(0);
  });

  it("excludes reminders with no due date", () => {
    const r = makeReminder({ dueAt: null });
    expect(filterOverdue([r], LOCAL_NOW)).toHaveLength(0);
  });

  it("excludes completed reminders even if overdue", () => {
    const r = makeReminder({ dueAt: LOCAL_OVERDUE, isDone: true });
    expect(filterOverdue([r], LOCAL_NOW)).toHaveLength(0);
  });
});

// ─── filterToday ─────────────────────────────────────────────────────────────

describe("filterToday", () => {
  it("includes reminders due earlier today", () => {
    const r = makeReminder({ dueAt: LOCAL_TODAY_MORNING });
    expect(filterToday([r], LOCAL_NOW)).toHaveLength(1);
  });

  it("includes reminders due later today", () => {
    const r = makeReminder({ dueAt: LOCAL_TODAY_EVENING });
    expect(filterToday([r], LOCAL_NOW)).toHaveLength(1);
  });

  it("excludes overdue reminders", () => {
    const r = makeReminder({ dueAt: LOCAL_OVERDUE });
    expect(filterToday([r], LOCAL_NOW)).toHaveLength(0);
  });

  it("excludes future reminders", () => {
    const r = makeReminder({ dueAt: LOCAL_FUTURE });
    expect(filterToday([r], LOCAL_NOW)).toHaveLength(0);
  });

  it("excludes reminders with no due date", () => {
    const r = makeReminder({ dueAt: null });
    expect(filterToday([r], LOCAL_NOW)).toHaveLength(0);
  });

  it("excludes completed reminders", () => {
    const r = makeReminder({ dueAt: LOCAL_TODAY_MORNING, isDone: true });
    expect(filterToday([r], LOCAL_NOW)).toHaveLength(0);
  });

  it("sorts HIGH priority first", () => {
    const low = makeReminder({ id: "low", dueAt: LOCAL_TODAY_MORNING, priority: "LOW" });
    const high = makeReminder({ id: "high", dueAt: LOCAL_TODAY_MORNING, priority: "HIGH" });
    const normal = makeReminder({ id: "normal", dueAt: LOCAL_TODAY_MORNING, priority: "NORMAL" });
    const result = filterToday([low, normal, high], LOCAL_NOW);
    expect(result.map((r) => r.id)).toEqual(["high", "normal", "low"]);
  });
});

// ─── relativeTime ─────────────────────────────────────────────────────────────

describe("relativeTime", () => {
  const base = new Date(2024, 5, 15, 14, 0, 0);

  it("returns 'just now' for less than 1 minute", () => {
    expect(relativeTime(new Date(base.getTime() - 30_000), base)).toBe("just now");
  });

  it("returns minutes for under an hour", () => {
    expect(relativeTime(new Date(base.getTime() - 5 * 60_000), base)).toBe("5m ago");
  });

  it("returns hours for under a day", () => {
    expect(relativeTime(new Date(base.getTime() - 3 * 3600_000), base)).toBe("3h ago");
  });

  it("returns 'yesterday' for exactly 1 day ago", () => {
    expect(relativeTime(new Date(base.getTime() - 24 * 3600_000), base)).toBe("yesterday");
  });

  it("returns days for multiple days", () => {
    expect(relativeTime(new Date(base.getTime() - 3 * 24 * 3600_000), base)).toBe("3d ago");
  });
});
