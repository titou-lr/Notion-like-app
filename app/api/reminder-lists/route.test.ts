import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockGetUserReminderLists, mockCreateReminderList } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetUserReminderLists: vi.fn(),
  mockCreateReminderList: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock("@/lib/data/reminders", () => ({
  getUserReminderLists: mockGetUserReminderLists,
  createReminderList: mockCreateReminderList,
}));

import { GET, POST } from "./route";

const authedUser = { id: "user-1", email: "test@example.com" };
const makePost = (body: unknown) =>
  new Request("http://localhost/api/reminder-lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("GET /api/reminder-lists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns lists for the user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockGetUserReminderLists.mockResolvedValue([{ id: "l1", name: "Work", color: null }]);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([{ id: "l1", name: "Work", color: null }]);
  });
});

describe("POST /api/reminder-lists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const res = await POST(makePost({ name: "Work" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing name", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    const res = await POST(makePost({ color: "#f00" }));
    expect(res.status).toBe(400);
  });

  it("creates a list and returns 201", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockCreateReminderList.mockResolvedValue({ id: "l-new", name: "Work", color: "#0ea5e9" });

    const res = await POST(makePost({ name: "Work", color: "#0ea5e9" }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toMatchObject({ id: "l-new", name: "Work" });
    expect(mockCreateReminderList).toHaveBeenCalledWith("user-1", "test@example.com", { name: "Work", color: "#0ea5e9" });
  });
});
