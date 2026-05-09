import { prisma } from "@/lib/prisma/client";
import type { SearchResult } from "@/types";

export function extractExcerpt(text: string, query: string, radius = 60): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return text.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

export async function searchPages(userId: string, query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase();

  const pages = await prisma.page.findMany({
    where: { userId, isDeleted: false },
    select: {
      id: true,
      title: true,
      icon: true,
      blocks: {
        select: { content: true },
        orderBy: { order: "asc" },
      },
    },
  });

  const results: SearchResult[] = [];

  for (const page of pages) {
    const titleMatch = page.title.toLowerCase().includes(lowerQuery);
    const matchingBlock = page.blocks.find((block) => {
      const text = (block.content as Record<string, unknown>).text;
      return typeof text === "string" && text.toLowerCase().includes(lowerQuery);
    });

    if (titleMatch || matchingBlock) {
      let excerpt: string | null = null;
      if (matchingBlock) {
        const text = (matchingBlock.content as Record<string, unknown>).text as string;
        excerpt = extractExcerpt(text, query);
      }
      results.push({ pageId: page.id, pageTitle: page.title, pageIcon: page.icon, excerpt });
    }
  }

  return results.slice(0, 20);
}
