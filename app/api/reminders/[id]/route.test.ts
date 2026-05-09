import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockUpdateReminder, mockSoftDeleteReminder } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpdateReminder: vi.fn(),
  mockSoftDeleteReminder: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock("@/lib/data/reminders", () => ({
  updateReminder: mockUpdateReminder,
  softDeleteReminder: mockSoftDeleteReminder,
}));

import { PATCH, DELETE } from "./route";

const authedUser = { id: "user-1", email: "test@example.com" };
const makeParams = (id = "rem-1") => ({ params: { id } });
const makePatch = (body: unknown) =>
  new Request("http://localhost/api/reminders/rem-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("PATCH /api/reminders/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const res = await PATCH(makePatch({ isDone: true }), makeParams());
    expect(res.status).toBe(401);
  });

  it("returns 400 when no fields provided", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    const res = await PATCH(makePatch({}), makeParams());
    expect(res.status).toBe(400);
  });

  it("toggles isDone and returns ok", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockUpdateReminder.mockResolvedValue({ count: 1 });

    const res = await PATCH(makePatch({ isDone: true }), makeParams());
    expect(res.status).toBe(200);
    expect(mockUpdateReminder).toHaveBeenCalledWith("rem-1", "user-1", { isDone: true });
  });

  it("converts dueAt string to Date", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockUpdateReminder.mockResolvedValue({ count: 1 });

    await PATCH(makePatch({ dueAt: "2024-06-01T09:00:00Z" }), makeParams());

    expect(mockUpdateReminder).toHaveBeenCalledWith(
      "rem-1",
      "user-1",
      expect.objectContaining({ dueAt: new Date("2024-06-01T09:00:00Z") })
    );
  });

  it("clears dueAt when null is sent", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockUpdateReminder.mockResolvedValue({ count: 1 });

    await PATCH(makePatch({ dueAt: null }), makeParams());

    expect(mockUpdateReminder).toHaveBeenCalledWith(
      "rem-1",
      "user-1",
      expect.objectContaining({ dueAt: null })
    );
  });

  it("returns 400 for invalid priority", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    const res = await PATCH(makePatch({ priority: "ULTRA" }), makeParams());
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/reminders/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const res = await DELETE(new Request("http://localhost/api/reminders/rem-1"), makeParams());
    expect(res.status).toBe(401);
  });

  it("soft-deletes the reminder", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockSoftDeleteReminder.mockResolvedValue({ count: 1 });

    const res = await DELETE(new Request("http://localhost/api/reminders/rem-1"), makeParams());
    expect(res.status).toBe(200);
    expect(mockSoftDeleteReminder).toHaveBeenCalledWith("rem-1", "user-1");
  });
});
