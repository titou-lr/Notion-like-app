import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockGetUserReminders, mockCreateReminder } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetUserReminders: vi.fn(),
  mockCreateReminder: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock("@/lib/data/reminders", () => ({
  getUserReminders: mockGetUserReminders,
  createReminder: mockCreateReminder,
}));

import { GET, POST } from "./route";

const authedUser = { id: "user-1", email: "test@example.com" };
const makeReq = (body?: unknown, url = "http://localhost/api/reminders") =>
  new Request(url, {
    method: body !== undefined ? "POST" : "GET",
    ...(body !== undefined
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : {}),
  });

describe("GET /api/reminders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it("returns all reminders for the user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockGetUserReminders.mockResolvedValue([{ id: "r1", title: "Buy milk" }]);

    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([{ id: "r1", title: "Buy milk" }]);
    expect(mockGetUserReminders).toHaveBeenCalledWith("user-1", "test@example.com", { listId: undefined, todayFilter: false });
  });

  it("passes listId query param to data layer", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockGetUserReminders.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/reminders?listId=list-1"));
    expect(mockGetUserReminders).toHaveBeenCalledWith("user-1", "test@example.com", { listId: "list-1", todayFilter: false });
  });

  it("passes todayFilter when filter=today", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockGetUserReminders.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/reminders?filter=today"));
    expect(mockGetUserReminders).toHaveBeenCalledWith("user-1", "test@example.com", { listId: undefined, todayFilter: true });
  });
});

describe("POST /api/reminders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const res = await POST(makeReq({ title: "Test" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing title", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    const res = await POST(makeReq({ description: "no title" }));
    expect(res.status).toBe(400);
  });

  it("creates a reminder and returns 201", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockCreateReminder.mockResolvedValue({ id: "new-1", title: "Buy milk" });

    const res = await POST(makeReq({ title: "Buy milk" }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toMatchObject({ id: "new-1", title: "Buy milk" });
    expect(mockCreateReminder).toHaveBeenCalledWith("user-1", "test@example.com", { title: "Buy milk", dueAt: undefined });
  });

  it("converts dueAt string to Date", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockCreateReminder.mockResolvedValue({ id: "new-2", title: "Meeting" });

    await POST(makeReq({ title: "Meeting", dueAt: "2024-01-20T10:00:00Z" }));

    expect(mockCreateReminder).toHaveBeenCalledWith(
      "user-1",
      "test@example.com",
      expect.objectContaining({ dueAt: new Date("2024-01-20T10:00:00Z") })
    );
  });

  it("returns 400 for invalid JSON", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    const res = await POST(new Request("http://localhost/api/reminders", { method: "POST", body: "bad json" }));
    expect(res.status).toBe(400);
  });
});
