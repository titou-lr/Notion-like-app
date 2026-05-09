import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockDeleteReminderList } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockDeleteReminderList: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock("@/lib/data/reminders", () => ({
  deleteReminderList: mockDeleteReminderList,
}));

import { DELETE } from "./route";

const authedUser = { id: "user-1", email: "test@example.com" };
const makeParams = (id = "list-1") => ({ params: { id } });

describe("DELETE /api/reminder-lists/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const res = await DELETE(new Request("http://localhost/api/reminder-lists/list-1"), makeParams());
    expect(res.status).toBe(401);
  });

  it("deletes the list scoped to the user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockDeleteReminderList.mockResolvedValue({ count: 1 });

    const res = await DELETE(new Request("http://localhost/api/reminder-lists/list-1"), makeParams());
    expect(res.status).toBe(200);
    expect(mockDeleteReminderList).toHaveBeenCalledWith("list-1", "user-1");
  });
});
