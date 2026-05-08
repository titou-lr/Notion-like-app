import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    block: {
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { updateBlock, createBlock, deleteBlock } from "./blocks";
import { prisma } from "@/lib/prisma/client";

describe("updateBlock", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls prisma.block.update with content only when type is omitted", async () => {
    vi.mocked(prisma.block.update).mockResolvedValue({ id: "block-1" } as never);

    await updateBlock("block-1", { text: "Hello" });

    expect(prisma.block.update).toHaveBeenCalledWith({
      where: { id: "block-1" },
      data: { content: { text: "Hello" } },
      select: { id: true },
    });
  });

  it("includes order in the update data when provided", async () => {
    vi.mocked(prisma.block.update).mockResolvedValue({ id: "block-1" } as never);

    await updateBlock("block-1", { text: "" }, undefined, 3);

    expect(prisma.block.update).toHaveBeenCalledWith({
      where: { id: "block-1" },
      data: { content: { text: "" }, order: 3 },
      select: { id: true },
    });
  });

  it("includes type in the update data when provided", async () => {
    vi.mocked(prisma.block.update).mockResolvedValue({ id: "block-1" } as never);

    await updateBlock("block-1", { text: "" }, "HEADING_1");

    expect(prisma.block.update).toHaveBeenCalledWith({
      where: { id: "block-1" },
      data: { content: { text: "" }, type: "HEADING_1" },
      select: { id: true },
    });
  });
});

describe("createBlock", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls prisma.block.create with the correct fields", async () => {
    vi.mocked(prisma.block.create).mockResolvedValue({
      id: "new-block",
      type: "TEXT",
      content: { text: "" },
      order: 0,
    } as never);

    await createBlock("page-1", "TEXT", { text: "" }, 0);

    expect(prisma.block.create).toHaveBeenCalledWith({
      data: { pageId: "page-1", type: "TEXT", content: { text: "" }, order: 0 },
      select: { id: true, type: true, content: true, order: true },
    });
  });

  it("returns the created block", async () => {
    const mockBlock = { id: "new-block", type: "TEXT", content: { text: "" }, order: 0 };
    vi.mocked(prisma.block.create).mockResolvedValue(mockBlock as never);

    const result = await createBlock("page-1", "TEXT", { text: "" }, 0);

    expect(result).toEqual(mockBlock);
  });
});

describe("deleteBlock", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls prisma.block.delete with the correct id", async () => {
    vi.mocked(prisma.block.delete).mockResolvedValue({} as never);

    await deleteBlock("block-1");

    expect(prisma.block.delete).toHaveBeenCalledWith({
      where: { id: "block-1" },
    });
  });
});
