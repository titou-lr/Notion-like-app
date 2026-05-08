import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockCreateBlock } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCreateBlock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock("@/lib/data/blocks", () => ({
  createBlock: mockCreateBlock,
}));

import { POST } from "./route";

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/pages/page-1/blocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/pages/[id]/blocks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "Unauthorized" } });

    const res = await POST(makeRequest({ type: "TEXT", content: { text: "" }, order: 0 }), {
      params: { id: "page-1" },
    });
    expect(res.status).toBe(401);
  });

  it("creates a block and returns 201", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    mockCreateBlock.mockResolvedValue({ id: "new-block", type: "TEXT", content: { text: "" }, order: 0 });

    const res = await POST(makeRequest({ type: "TEXT", content: { text: "" }, order: 0 }), {
      params: { id: "page-1" },
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBe("new-block");
  });
});
