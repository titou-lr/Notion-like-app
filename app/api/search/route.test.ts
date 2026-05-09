import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1", email: "test@example.com" } },
        error: null,
      }),
    },
  }),
}));

vi.mock("@/lib/data/search", () => ({
  searchPages: vi.fn().mockResolvedValue([]),
}));

const { searchPages } = await import("@/lib/data/search");

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when q param is missing", async () => {
    const req = new Request("http://localhost/api/search");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when q is a single character", async () => {
    const req = new Request("http://localhost/api/search?q=a");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when q is blank whitespace", async () => {
    const req = new Request("http://localhost/api/search?q=+");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with data array on valid query", async () => {
    vi.mocked(searchPages).mockResolvedValue([
      { pageId: "p1", pageTitle: "Test Page", pageIcon: null, excerpt: "some excerpt" },
    ]);
    const req = new Request("http://localhost/api/search?q=test");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].pageId).toBe("p1");
  });

  it("passes trimmed query to searchPages", async () => {
    vi.mocked(searchPages).mockResolvedValue([]);
    const req = new Request("http://localhost/api/search?q=hello+world");
    await GET(req);
    expect(searchPages).toHaveBeenCalledWith("user-1", "hello world");
  });

  it("returns empty data array when no results found", async () => {
    vi.mocked(searchPages).mockResolvedValue([]);
    const req = new Request("http://localhost/api/search?q=noresults");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});
