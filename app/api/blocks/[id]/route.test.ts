import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockUpdateBlock, mockDeleteBlock } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpdateBlock: vi.fn(),
  mockDeleteBlock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock("@/lib/data/blocks", () => ({
  updateBlock: mockUpdateBlock,
  deleteBlock: mockDeleteBlock,
}));

import { PATCH, DELETE } from "./route";

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/blocks/block-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("PATCH /api/blocks/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "Unauthorized" } });

    const res = await PATCH(makeRequest({ content: { text: "Hi" } }), { params: { id: "block-1" } });
    expect(res.status).toBe(401);
  });

  it("updates the block and returns 200", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    mockUpdateBlock.mockResolvedValue({ id: "block-1" });

    const res = await PATCH(makeRequest({ content: { text: "Updated" } }), { params: { id: "block-1" } });
    expect(res.status).toBe(200);
    expect(mockUpdateBlock).toHaveBeenCalledWith("block-1", { text: "Updated" }, undefined, undefined);
  });

  it("passes order to updateBlock when included in the request body", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    mockUpdateBlock.mockResolvedValue({ id: "block-1" });

    const res = await PATCH(makeRequest({ content: { text: "" }, order: 2 }), { params: { id: "block-1" } });
    expect(res.status).toBe(200);
    expect(mockUpdateBlock).toHaveBeenCalledWith("block-1", { text: "" }, undefined, 2);
  });

  it("passes type to updateBlock when included in the request body", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    mockUpdateBlock.mockResolvedValue({ id: "block-1" });

    const res = await PATCH(makeRequest({ content: { text: "" }, type: "HEADING_1" }), { params: { id: "block-1" } });
    expect(res.status).toBe(200);
    expect(mockUpdateBlock).toHaveBeenCalledWith("block-1", { text: "" }, "HEADING_1", undefined);
  });
});

describe("DELETE /api/blocks/[id]", () => {
  const deleteRequest = new Request("http://localhost/api/blocks/block-1", { method: "DELETE" });

  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "Unauthorized" } });

    const res = await DELETE(deleteRequest, { params: { id: "block-1" } });
    expect(res.status).toBe(401);
  });

  it("deletes the block and returns 200", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    mockDeleteBlock.mockResolvedValue(undefined);

    const res = await DELETE(deleteRequest, { params: { id: "block-1" } });
    expect(res.status).toBe(200);
    expect(mockDeleteBlock).toHaveBeenCalledWith("block-1");
  });
});
