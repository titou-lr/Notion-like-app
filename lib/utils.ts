import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SidebarPage } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildPageTree(
  pages: Array<{ id: string; title: string; icon: string | null; parentId: string | null }>
): SidebarPage[] {
  const map = new Map<string, SidebarPage>()
  for (const page of pages) {
    map.set(page.id, { ...page, children: [] })
  }

  const roots: SidebarPage[] = []
  for (const page of pages) {
    const node = map.get(page.id)!
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}
