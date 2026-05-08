import type { BlockType } from "@/types";

interface SlashMenuItem {
  type: BlockType;
  label: string;
  description: string;
}

export const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  { type: "TEXT", label: "Text", description: "Plain paragraph" },
  { type: "HEADING_1", label: "Heading 1", description: "Large title" },
  { type: "HEADING_2", label: "Heading 2", description: "Medium title" },
  { type: "HEADING_3", label: "Heading 3", description: "Small title" },
  { type: "BULLET_LIST", label: "Bullet List", description: "Unordered list" },
  { type: "NUMBERED_LIST", label: "Numbered List", description: "Numbered list" },
  { type: "CODE", label: "Code", description: "Code block" },
  { type: "QUOTE", label: "Quote", description: "Block quote" },
  { type: "TODO", label: "To-do", description: "Checkbox item" },
  { type: "DIVIDER", label: "Divider", description: "Horizontal rule" },
];

export function getFilteredItems(filter: string): SlashMenuItem[] {
  if (!filter) return SLASH_MENU_ITEMS;
  const f = filter.toLowerCase();
  return SLASH_MENU_ITEMS.filter(
    (item) => item.label.toLowerCase().includes(f) || item.type.toLowerCase().includes(f)
  );
}

interface SlashMenuProps {
  filter: string;
  activeIndex: number;
  onSelect: (type: BlockType) => void;
}

export function SlashMenu({ filter, activeIndex, onSelect }: SlashMenuProps) {
  const items = getFilteredItems(filter);

  return (
    <div
      className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl glass shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {items.length === 0 ? (
        <p className="px-3 py-2 text-sm text-text-secondary">No results</p>
      ) : (
        <ul role="listbox">
          {items.map((item, i) => (
            <li
              key={item.type}
              role="option"
              aria-selected={i === activeIndex}
              className={`flex cursor-pointer flex-col px-3 py-3 md:py-2 transition-all duration-150 ${
                i === activeIndex ? "bg-white/[0.13]" : "hover:bg-white/[0.08]"
              }`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onSelect(item.type)}
            >
              <span className="text-sm font-medium text-text-primary">{item.label}</span>
              <span className="text-xs text-text-secondary">{item.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
