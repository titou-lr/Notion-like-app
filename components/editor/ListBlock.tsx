import type { BlockType } from "@/types";
import { SlashMenu } from "./SlashMenu";

interface ListBlockProps {
  blockId: string;
  type: "BULLET_LIST" | "NUMBERED_LIST";
  text: string;
  listIndex: number;
  onChange: (id: string, text: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onRef: (id: string, el: HTMLTextAreaElement | null) => void;
  slashFilter: string | null;
  slashActiveIndex: number;
  onSlashSelect: (type: BlockType) => void;
}

export function ListBlock({
  blockId,
  type,
  text,
  listIndex,
  onChange,
  onKeyDown,
  onRef,
  slashFilter,
  slashActiveIndex,
  onSlashSelect,
}: ListBlockProps) {
  const prefix = type === "BULLET_LIST" ? "•" : `${listIndex}.`;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "0";
    e.target.style.height = `${e.target.scrollHeight}px`;
    onChange(blockId, e.target.value);
  };

  return (
    <div className="flex items-start gap-2">
      <span className="select-none pt-0.5 text-base text-text-secondary">{prefix}</span>
      <div className="relative flex-1">
        <textarea
          ref={(el) => onRef(blockId, el)}
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => onKeyDown(blockId, e)}
          placeholder="List item…"
          rows={1}
          className="w-full resize-none overflow-hidden bg-transparent text-base leading-[1.6] text-text-primary outline-none"
        />
        {slashFilter !== null && (
          <SlashMenu
            filter={slashFilter}
            activeIndex={slashActiveIndex}
            onSelect={onSlashSelect}
          />
        )}
      </div>
    </div>
  );
}
