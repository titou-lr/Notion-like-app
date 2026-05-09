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

export type Priority = "LOW" | "NORMAL" | "HIGH";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  color: string | null;
  category: string | null;
  isRecurring: boolean;
  recurrence: string | null;
  sourceLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  color?: string;
  category?: string;
  isRecurring?: boolean;
  recurrence?: string;
}

export interface ReminderListItem {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  dueAt?: string;
  priority?: Priority;
  listId?: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: Priority;
  isDone: boolean;
  listId: string | null;
  list: { id: string; name: string; color: string | null } | null;
  createdAt: string;
  updatedAt: string;
}
