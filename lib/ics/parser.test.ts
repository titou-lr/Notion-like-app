import { describe, it, expect } from "vitest";
import { parseIcs } from "./parser";

// Minimal valid ICS skeleton
function ics(body: string) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Test//Test//EN",
    body,
    "END:VCALENDAR",
  ].join("\r\n");
}

function vevent(props: string) {
  return ["BEGIN:VEVENT", props, "END:VEVENT"].join("\r\n");
}

// ─── Basic parsing ────────────────────────────────────────────────────────────

describe("parseIcs — basic event", () => {
  it("parses a simple UTC event", () => {
    const content = ics(
      vevent(
        [
          "UID:simple-1@test",
          "SUMMARY:Team Meeting",
          "DTSTART:20240115T090000Z",
          "DTEND:20240115T100000Z",
        ].join("\r\n")
      )
    );

    const { events, errors } = parseIcs(content);
    expect(errors).toHaveLength(0);
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Team Meeting");
    expect(events[0].startAt).toEqual(new Date("2024-01-15T09:00:00Z"));
    expect(events[0].endAt).toEqual(new Date("2024-01-15T10:00:00Z"));
    expect(events[0].isRecurring).toBe(false);
    expect(events[0].recurrence).toBeUndefined();
  });

  it("includes description when present", () => {
    const content = ics(
      vevent(
        [
          "UID:desc-1@test",
          "SUMMARY:With Desc",
          "DTSTART:20240115T090000Z",
          "DTEND:20240115T100000Z",
          "DESCRIPTION:Some notes here",
        ].join("\r\n")
      )
    );

    const { events } = parseIcs(content);
    expect(events[0].description).toBe("Some notes here");
  });

  it("omits description when absent", () => {
    const content = ics(
      vevent(
        [
          "UID:nodesc-1@test",
          "SUMMARY:No Desc",
          "DTSTART:20240115T090000Z",
          "DTEND:20240115T100000Z",
        ].join("\r\n")
      )
    );

    const { events } = parseIcs(content);
    expect(events[0].description).toBeUndefined();
  });
});

// ─── All-day events ───────────────────────────────────────────────────────────

describe("parseIcs — all-day events (VALUE=DATE)", () => {
  it("normalises a DATE-only event to midnight UTC", () => {
    const content = ics(
      vevent(
        [
          "UID:allday-1@test",
          "SUMMARY:Conference",
          "DTSTART;VALUE=DATE:20240320",
          "DTEND;VALUE=DATE:20240321",
        ].join("\r\n")
      )
    );

    const { events, errors } = parseIcs(content);
    expect(errors).toHaveLength(0);
    expect(events[0].startAt).toEqual(new Date("2024-03-20T00:00:00Z"));
    expect(events[0].endAt).toEqual(new Date("2024-03-21T00:00:00Z"));
  });
});

// ─── Recurring events ────────────────────────────────────────────────────────

describe("parseIcs — recurring events", () => {
  it("marks weekly recurring events and stores the RRULE string", () => {
    const content = ics(
      vevent(
        [
          "UID:recur-1@test",
          "SUMMARY:Weekly Standup",
          "DTSTART:20240101T090000Z",
          "DTEND:20240101T093000Z",
          "RRULE:FREQ=WEEKLY;BYDAY=MO",
        ].join("\r\n")
      )
    );

    const { events, errors } = parseIcs(content);
    expect(errors).toHaveLength(0);
    expect(events[0].isRecurring).toBe(true);
    expect(events[0].recurrence).toContain("FREQ=WEEKLY");
    expect(events[0].recurrence).toContain("BYDAY=MO");
  });

  it("marks monthly recurring events", () => {
    const content = ics(
      vevent(
        [
          "UID:recur-2@test",
          "SUMMARY:Monthly Review",
          "DTSTART:20240101T140000Z",
          "DTEND:20240101T150000Z",
          "RRULE:FREQ=MONTHLY;BYMONTHDAY=1",
        ].join("\r\n")
      )
    );

    const { events } = parseIcs(content);
    expect(events[0].isRecurring).toBe(true);
    expect(events[0].recurrence).toContain("FREQ=MONTHLY");
  });

  it("marks non-recurring events correctly", () => {
    const content = ics(
      vevent(
        [
          "UID:norec-1@test",
          "SUMMARY:One-off",
          "DTSTART:20240115T090000Z",
          "DTEND:20240115T100000Z",
        ].join("\r\n")
      )
    );

    const { events } = parseIcs(content);
    expect(events[0].isRecurring).toBe(false);
    expect(events[0].recurrence).toBeUndefined();
  });
});

// ─── Multiple events ──────────────────────────────────────────────────────────

describe("parseIcs — multiple events", () => {
  it("returns all events in the calendar", () => {
    const content = ics(
      [
        vevent(
          ["UID:e1@test", "SUMMARY:Event A", "DTSTART:20240101T090000Z", "DTEND:20240101T100000Z"].join("\r\n")
        ),
        vevent(
          ["UID:e2@test", "SUMMARY:Event B", "DTSTART:20240102T090000Z", "DTEND:20240102T100000Z"].join("\r\n")
        ),
      ].join("\r\n")
    );

    const { events } = parseIcs(content);
    expect(events).toHaveLength(2);
    expect(events.map((e) => e.title)).toEqual(["Event A", "Event B"]);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("parseIcs — error handling", () => {
  it("returns error and empty events for completely invalid input", () => {
    const { events, errors } = parseIcs("NOT VALID ICS CONTENT AT ALL !!!");
    expect(events).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("skips events missing SUMMARY and records an error", () => {
    const content = ics(
      vevent(
        ["UID:nosummary@test", "DTSTART:20240115T090000Z", "DTEND:20240115T100000Z"].join("\r\n")
      )
    );

    const { events, errors } = parseIcs(content);
    expect(events).toHaveLength(0);
    expect(errors.some((e) => e.includes("SUMMARY"))).toBe(true);
  });

  it("continues parsing valid events when one is malformed", () => {
    const content = ics(
      [
        // Valid event
        vevent(
          ["UID:ok@test", "SUMMARY:Good Event", "DTSTART:20240115T090000Z", "DTEND:20240115T100000Z"].join("\r\n")
        ),
        // Missing SUMMARY — skipped
        vevent(["UID:bad@test", "DTSTART:20240115T090000Z", "DTEND:20240115T100000Z"].join("\r\n")),
      ].join("\r\n")
    );

    const { events, errors } = parseIcs(content);
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Good Event");
    expect(errors).toHaveLength(1);
  });
});

// ─── Date filtering helpers ───────────────────────────────────────────────────

describe("date range filtering", () => {
  const events = [
    { startAt: new Date("2024-01-10T00:00:00Z"), endAt: new Date("2024-01-10T01:00:00Z") },
    { startAt: new Date("2024-01-15T00:00:00Z"), endAt: new Date("2024-01-15T01:00:00Z") },
    { startAt: new Date("2024-01-20T00:00:00Z"), endAt: new Date("2024-01-20T01:00:00Z") },
  ];

  function filterByRange(
    list: { startAt: Date; endAt: Date }[],
    from: Date,
    to: Date
  ) {
    return list.filter((e) => e.startAt >= from && e.startAt <= to);
  }

  it("returns events within the range", () => {
    const from = new Date("2024-01-12T00:00:00Z");
    const to = new Date("2024-01-18T00:00:00Z");
    const result = filterByRange(events, from, to);
    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2024-01-15T00:00:00Z"));
  });

  it("includes events on range boundaries", () => {
    const from = new Date("2024-01-10T00:00:00Z");
    const to = new Date("2024-01-20T00:00:00Z");
    const result = filterByRange(events, from, to);
    expect(result).toHaveLength(3);
  });

  it("returns empty when no events fall in range", () => {
    const from = new Date("2024-02-01T00:00:00Z");
    const to = new Date("2024-02-28T00:00:00Z");
    const result = filterByRange(events, from, to);
    expect(result).toHaveLength(0);
  });
});
