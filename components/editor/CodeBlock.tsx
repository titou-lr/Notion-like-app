import type { BlockType } from "@/types";
import { SlashMenu } from "./SlashMenu";

interface CodeBlockProps {
  blockId: string;
  text: string;
  language: string;
  onChange: (id: string, text: string) => void;
  onLanguageChange: (id: string, language: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onRef: (id: string, el: HTMLTextAreaElement | null) => void;
  slashFilter: string | null;
  slashActiveIndex: number;
  onSlashSelect: (type: BlockType) => void;
}

export function CodeBlock({
  blockId,
  text,
  language,
  onChange,
  onLanguageChange,
  onKeyDown,
  onRef,
  slashFilter,
  slashActiveIndex,
  onSlashSelect,
}: CodeBlockProps) {
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "0";
    e.target.style.height = `${e.target.scrollHeight}px`;
    onChange(blockId, e.target.value);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur-md px-4 py-3">
      <input
        type="text"
        value={language}
        onChange={(e) => onLanguageChange(blockId, e.target.value)}
        placeholder="Plain text"
        className="mb-2 block w-full bg-transparent text-xs text-text-secondary outline-none"
      />
      <div className="relative">
        <textarea
          ref={(el) => onRef(blockId, el)}
          value={text}
          onChange={handleCodeChange}
          onKeyDown={(e) => onKeyDown(blockId, e)}
          placeholder="// Write your code here…"
          rows={1}
          className="w-full resize-none overflow-hidden bg-transparent font-mono text-sm leading-[1.6] text-text-primary outline-none"
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
