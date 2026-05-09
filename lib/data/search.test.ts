import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractExcerpt, searchPages } from "./search";

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    page: {
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma/client");

describe("extractExcerpt", () => {
  it("returns surrounding text around the match", () => {
    const result = extractExcerpt("The quick brown fox jumps", "brown", 5);
    expect(result).toContain("brown");
  });

  it("adds leading ellipsis when match is deep in the string", () => {
    const long = "a".repeat(100) + "match" + "b".repeat(100);
    expect(extractExcerpt(long, "match", 10)).toMatch(/^…/);
  });

  it("adds trailing ellipsis when match is near the start", () => {
    const long = "match" + "b".repeat(100);
    expect(extractExcerpt(long, "match", 10)).toMatch(/…$/);
  });

  it("returns beginning of text when there is no match", () => {
    const result = extractExcerpt("Hello world", "xyz", 60);
    expect(result).toBe("Hello world");
  });

  it("returns full text without ellipsis when it fits within radius", () => {
    const result = extractExcerpt("short match text", "match", 60);
    expect(result).toBe("short match text");
  });
});

describe("searchPages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array for a blank query", async () => {
    const results = await searchPages("user-1", "   ");
    expect(results).toEqual([]);
    expect(prisma.page.findMany).not.toHaveBeenCalled();
  });

  it("returns a page when its title matches", async () => {
    vi.mocked(prisma.page.findMany).mockResolvedValue([
      { id: "p1", title: "My Notes", icon: null, blocks: [] },
    ] as never);

    const results = await searchPages("user-1", "notes");
    expect(results).toHaveLength(1);
    expect(results[0].pageId).toBe("p1");
    expect(results[0].excerpt).toBeNull();
  });

  it("returns page with excerpt when a block content matches", async () => {
    vi.mocked(prisma.page.findMany).mockResolvedValue([
      {
        id: "p2",
        title: "Untitled",
        icon: "📝",
        blocks: [{ content: { text: "Hello world this is a test phrase" } }],
      },
    ] as never);

    const results = await searchPages("user-1", "test");
    expect(results).toHaveLength(1);
    expect(results[0].excerpt).toContain("test");
    expect(results[0].pageIcon).toBe("📝");
  });

  it("excludes pages with no matching title or block content", async () => {
    vi.mocked(prisma.page.findMany).mockResolvedValue([
      {
        id: "p3",
        title: "Unrelated",
        icon: null,
        blocks: [{ content: { text: "Nothing here" } }],
      },
    ] as never);

    const results = await searchPages("user-1", "xyz");
    expect(results).toHaveLength(0);
  });

  it("ignores blocks without a text field (e.g. IMAGE, DIVIDER)", async () => {
    vi.mocked(prisma.page.findMany).mockResolvedValue([
      {
        id: "p4",
        title: "Unrelated",
        icon: null,
        blocks: [{ content: { url: "https://example.com/image.png" } }],
      },
    ] as never);

    const results = await searchPages("user-1", "example");
    expect(results).toHaveLength(0);
  });

  it("matches case-insensitively", async () => {
    vi.mocked(prisma.page.findMany).mockResolvedValue([
      { id: "p5", title: "Project Plan", icon: null, blocks: [] },
    ] as never);

    const results = await searchPages("user-1", "PROJECT");
    expect(results).toHaveLength(1);
  });

  it("limits results to 20 even when more pages match", async () => {
    const pages = Array.from({ length: 30 }, (_, i) => ({
      id: `p${i}`,
      title: "match",
      icon: null,
      blocks: [],
    }));
    vi.mocked(prisma.page.findMany).mockResolvedValue(pages as never);

    const results = await searchPages("user-1", "match");
    expect(results).toHaveLength(20);
  });
});
