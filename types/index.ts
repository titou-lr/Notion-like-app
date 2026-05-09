export type BlockType =
  | "TEXT"
  | "HEADING_1"
  | "HEADING_2"
  | "HEADING_3"
  | "BULLET_LIST"
  | "NUMBERED_LIST"
  | "CODE"
  | "IMAGE"
  | "DIVIDER"
  | "QUOTE"
  | "TODO";

export interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order: number;
}

export interface SidebarPage {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  children: SidebarPage[];
}

export interface SearchResult {
  pageId: string;
  pageTitle: string;
  pageIcon: string | null;
  excerpt: string | null;
}
