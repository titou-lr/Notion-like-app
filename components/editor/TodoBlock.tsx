import type { BlockType } from "@/types";
import { SlashMenu } from "./SlashMenu";

interface TodoBlockProps {
  blockId: string;
  text: string;
  checked: boolean;
  onChange: (id: string, text: string) => void;
  onToggle: (id: string, checked: boolean) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onRef: (id: string, el: HTMLTextAreaElement | null) => void;
  slashFilter: string | null;
  slashActiveIndex: number;
  onSlashSelect: (type: BlockType) => void;
}

export function TodoBlock({
  blockId,
  text,
  checked,
  onChange,
  onToggle,
  onKeyDown,
  onRef,
  slashFilter,
  slashActiveIndex,
  onSlashSelect,
}: TodoBlockProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "0";
    e.target.style.height = `${e.target.scrollHeight}px`;
    onChange(blockId, e.target.value);
  };

  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(blockId, e.target.checked)}
        className="mt-1 h-4 w-4 cursor-pointer accent-accent"
      />
      <div className="relative flex-1">
        <textarea
          ref={(el) => onRef(blockId, el)}
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => onKeyDown(blockId, e)}
          placeholder="To-do…"
          rows={1}
          className={`w-full resize-none overflow-hidden bg-transparent text-base leading-relaxed outline-none ${
            checked ? "text-text-secondary line-through" : "text-text-primary"
          }`}
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
