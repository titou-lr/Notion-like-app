import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetUser,
  mockUpdatePageIcon,
  mockSoftDeletePage,
  mockPermanentDeletePage,
  mockRestorePage,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpdatePageIcon: vi.fn(),
  mockSoftDeletePage: vi.fn(),
  mockPermanentDeletePage: vi.fn(),
  mockRestorePage: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock("@/lib/data/pages", () => ({
  updatePageIcon: mockUpdatePageIcon,
  softDeletePage: mockSoftDeletePage,
  permanentDeletePage: mockPermanentDeletePage,
  restorePage: mockRestorePage,
}));

import { PATCH, DELETE } from "./route";

const authedUser = { id: "user-1", email: "test@example.com" };

const req = (
  method: string,
  body?: unknown,
  url = "http://localhost/api/pages/page-1"
) =>
  new Request(url, {
    method,
    ...(body !== undefined
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : {}),
  });

describe("PATCH /api/pages/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await PATCH(req("PATCH", { icon: "🎯" }), { params: { id: "page-1" } });
    expect(res.status).toBe(401);
  });

  it("updates the page icon", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockUpdatePageIcon.mockResolvedValue({ count: 1 });

    const res = await PATCH(req("PATCH", { icon: "🎯" }), { params: { id: "page-1" } });
    expect(res.status).toBe(200);
    expect(mockUpdatePageIcon).toHaveBeenCalledWith("page-1", "user-1", "🎯");
  });

  it("clears the page icon when null is passed", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockUpdatePageIcon.mockResolvedValue({ count: 1 });

    const res = await PATCH(req("PATCH", { icon: null }), { params: { id: "page-1" } });
    expect(res.status).toBe(200);
    expect(mockUpdatePageIcon).toHaveBeenCalledWith("page-1", "user-1", null);
  });

  it("restores the page when isDeleted: false is sent", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockRestorePage.mockResolvedValue({ count: 1 });

    const res = await PATCH(req("PATCH", { isDeleted: false }), { params: { id: "page-1" } });
    expect(res.status).toBe(200);
    expect(mockRestorePage).toHaveBeenCalledWith("page-1", "user-1");
  });

  it("returns 400 for an empty body", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });

    const res = await PATCH(req("PATCH", {}), { params: { id: "page-1" } });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/pages/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await DELETE(req("DELETE"), { params: { id: "page-1" } });
    expect(res.status).toBe(401);
  });

  it("soft-deletes the page by default", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockSoftDeletePage.mockResolvedValue({ count: 1 });

    const res = await DELETE(req("DELETE"), { params: { id: "page-1" } });
    expect(res.status).toBe(200);
    expect(mockSoftDeletePage).toHaveBeenCalledWith("page-1", "user-1");
    expect(mockPermanentDeletePage).not.toHaveBeenCalled();
  });

  it("permanently deletes when ?permanent=true is set", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockPermanentDeletePage.mockResolvedValue({ count: 1 });

    const res = await DELETE(
      req("DELETE", undefined, "http://localhost/api/pages/page-1?permanent=true"),
      { params: { id: "page-1" } }
    );
    expect(res.status).toBe(200);
    expect(mockPermanentDeletePage).toHaveBeenCalledWith("page-1", "user-1");
    expect(mockSoftDeletePage).not.toHaveBeenCalled();
  });
});
