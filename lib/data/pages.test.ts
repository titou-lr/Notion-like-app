import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    user: { upsert: vi.fn() },
    page: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import {
  getUserPages,
  createPage,
  getPage,
  updatePageIcon,
  softDeletePage,
  restorePage,
  permanentDeletePage,
  getTrashedPages,
} from "./pages";
import { prisma } from "@/lib/prisma/client";

describe("getUserPages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts the Prisma user by email", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.page.findMany).mockResolvedValue([]);

    await getUserPages("supa-id-1", "test@example.com");

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      create: { id: "supa-id-1", email: "test@example.com" },
      update: {},
      select: { id: true },
    });
  });

  it("queries non-deleted pages ordered by updatedAt desc", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.page.findMany).mockResolvedValue([]);

    await getUserPages("supa-id-1", "test@example.com");

    expect(prisma.page.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1", isDeleted: false },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, icon: true, parentId: true },
    });
  });

  it("returns the pages from Prisma", async () => {
    const mockPages = [
      { id: "p1", title: "My Page", icon: null, parentId: null },
      { id: "p2", title: "", icon: "🎯", parentId: "p1" },
    ];
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.page.findMany).mockResolvedValue(mockPages as never);

    const pages = await getUserPages("supa-id-1", "test@example.com");

    expect(pages).toEqual(mockPages);
  });
});

describe("createPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts the user then creates a page for them", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.page.create).mockResolvedValue({ id: "page-1", title: "Untitled" } as never);

    await createPage("supa-id-1", "test@example.com");

    expect(prisma.page.create).toHaveBeenCalledWith({
      data: { userId: "user-1" },
      select: { id: true, title: true },
    });
  });

  it("returns the new page", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.page.create).mockResolvedValue({ id: "page-1", title: "Untitled" } as never);

    const page = await createPage("supa-id-1", "test@example.com");

    expect(page).toEqual({ id: "page-1", title: "Untitled" });
  });
});

describe("getPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries the page by id and userId", async () => {
    vi.mocked(prisma.page.findFirst).mockResolvedValue(null);

    await getPage("page-1", "user-1");

    expect(prisma.page.findFirst).toHaveBeenCalledWith({
      where: { id: "page-1", userId: "user-1", isDeleted: false },
      select: {
        id: true,
        title: true,
        icon: true,
        blocks: {
          orderBy: { order: "asc" },
          select: { id: true, type: true, content: true, order: true },
        },
      },
    });
  });

  it("returns the page when found", async () => {
    const mockPage = { id: "page-1", title: "My Page", icon: null };
    vi.mocked(prisma.page.findFirst).mockResolvedValue(mockPage as never);

    const page = await getPage("page-1", "user-1");

    expect(page).toEqual(mockPage);
  });

  it("returns null when the page is not found", async () => {
    vi.mocked(prisma.page.findFirst).mockResolvedValue(null);

    const page = await getPage("page-1", "user-1");

    expect(page).toBeNull();
  });
});

describe("updatePageIcon", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates the icon for a non-deleted page", async () => {
    vi.mocked(prisma.page.updateMany).mockResolvedValue({ count: 1 } as never);

    await updatePageIcon("page-1", "user-1", "🎯");

    expect(prisma.page.updateMany).toHaveBeenCalledWith({
      where: { id: "page-1", userId: "user-1", isDeleted: false },
      data: { icon: "🎯" },
    });
  });

  it("clears the icon when null is passed", async () => {
    vi.mocked(prisma.page.updateMany).mockResolvedValue({ count: 1 } as never);

    await updatePageIcon("page-1", "user-1", null);

    expect(prisma.page.updateMany).toHaveBeenCalledWith({
      where: { id: "page-1", userId: "user-1", isDeleted: false },
      data: { icon: null },
    });
  });
});

describe("softDeletePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets isDeleted to true on a non-deleted page", async () => {
    vi.mocked(prisma.page.updateMany).mockResolvedValue({ count: 1 } as never);

    await softDeletePage("page-1", "user-1");

    expect(prisma.page.updateMany).toHaveBeenCalledWith({
      where: { id: "page-1", userId: "user-1", isDeleted: false },
      data: { isDeleted: true },
    });
  });
});

describe("restorePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets isDeleted to false on a deleted page", async () => {
    vi.mocked(prisma.page.updateMany).mockResolvedValue({ count: 1 } as never);

    await restorePage("page-1", "user-1");

    expect(prisma.page.updateMany).toHaveBeenCalledWith({
      where: { id: "page-1", userId: "user-1", isDeleted: true },
      data: { isDeleted: false },
    });
  });
});

describe("permanentDeletePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("permanently removes the page from the database", async () => {
    vi.mocked(prisma.page.deleteMany).mockResolvedValue({ count: 1 } as never);

    await permanentDeletePage("page-1", "user-1");

    expect(prisma.page.deleteMany).toHaveBeenCalledWith({
      where: { id: "page-1", userId: "user-1" },
    });
  });
});

describe("getTrashedPages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns deleted pages for the user ordered by updatedAt desc", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.page.findMany).mockResolvedValue([
      { id: "p1", title: "Deleted Page", icon: "📝" },
    ] as never);

    const pages = await getTrashedPages("supa-id-1", "test@example.com");

    expect(prisma.page.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1", isDeleted: true },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, icon: true },
    });
    expect(pages).toEqual([{ id: "p1", title: "Deleted Page", icon: "📝" }]);
  });
});
