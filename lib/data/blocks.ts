import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";
import type { BlockType } from "@/types";

export async function updateBlock(
  blockId: string,
  content: Record<string, unknown>,
  type?: BlockType,
  order?: number
) {
  return prisma.block.update({
    where: { id: blockId },
    data: {
      content: content as Prisma.InputJsonValue,
      ...(type ? { type } : {}),
      ...(order !== undefined ? { order } : {}),
    },
    select: { id: true },
  });
}

export async function deleteBlock(blockId: string) {
  return prisma.block.delete({ where: { id: blockId } });
}

export async function createBlock(
  pageId: string,
  type: BlockType,
  content: Record<string, unknown>,
  order: number
) {
  return prisma.block.create({
    data: { pageId, type, content: content as Prisma.InputJsonValue, order },
    select: { id: true, type: true, content: true, order: true },
  });
}
