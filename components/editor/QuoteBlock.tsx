import type { BlockType } from "@/types";
import { SlashMenu } from "./SlashMenu";

interface QuoteBlockProps {
  blockId: string;
  text: string;
  onChange: (id: string, text: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onRef: (id: string, el: HTMLTextAreaElement | null) => void;
  slashFilter: string | null;
  slashActiveIndex: number;
  onSlashSelect: (type: BlockType) => void;
}

export function QuoteBlock({
  blockId,
  text,
  onChange,
  onKeyDown,
  onRef,
  slashFilter,
  slashActiveIndex,
  onSlashSelect,
}: QuoteBlockProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "0";
    e.target.style.height = `${e.target.scrollHeight}px`;
    onChange(blockId, e.target.value);
  };

  return (
    <div className="border-l-2 border-accent pl-4">
      <div className="relative">
        <textarea
          ref={(el) => onRef(blockId, el)}
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => onKeyDown(blockId, e)}
          placeholder="Quote…"
          rows={1}
          className="w-full resize-none overflow-hidden bg-transparent text-base italic leading-relaxed text-text-secondary outline-none"
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
