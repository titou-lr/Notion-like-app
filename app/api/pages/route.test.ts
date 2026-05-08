import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockGetUserPages, mockCreatePage } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetUserPages: vi.fn(),
  mockCreatePage: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock("@/lib/data/pages", () => ({
  getUserPages: mockGetUserPages,
  createPage: mockCreatePage,
}));

import { GET, POST } from "./route";

const authedUser = { id: "user-1", email: "test@example.com" };
const makeRequest = (body?: unknown) =>
  new Request("http://localhost/api/pages", {
    method: "POST",
    ...(body !== undefined
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });

describe("GET /api/pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });

    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns pages for the authenticated user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: authedUser },
      error: null,
    });
    mockGetUserPages.mockResolvedValue([{ id: "p1", title: "My Page", parentId: null }]);

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual([{ id: "p1", title: "My Page", parentId: null }]);
  });
});

describe("POST /api/pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });

    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
  });

  it("creates a root page when no parentId is provided", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockCreatePage.mockResolvedValue({ id: "new-page", title: "Untitled" });

    const response = await POST(makeRequest());
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data).toEqual({ id: "new-page", title: "Untitled" });
    expect(mockCreatePage).toHaveBeenCalledWith("user-1", "test@example.com", undefined);
  });

  it("creates a child page when parentId is provided in the body", async () => {
    mockGetUser.mockResolvedValue({ data: { user: authedUser }, error: null });
    mockCreatePage.mockResolvedValue({ id: "child-page", title: "Untitled" });

    const response = await POST(makeRequest({ parentId: "parent-page-id" }));
    expect(response.status).toBe(201);
    expect(mockCreatePage).toHaveBeenCalledWith(
      "user-1",
      "test@example.com",
      "parent-page-id"
    );
  });
});
