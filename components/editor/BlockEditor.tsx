"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import type { Block, BlockType } from "@/types";
import { SlashMenu, getFilteredItems } from "./SlashMenu";
import { ListBlock } from "./ListBlock";
import { TodoBlock } from "./TodoBlock";
import { CodeBlock } from "./CodeBlock";
import { QuoteBlock } from "./QuoteBlock";
import { DividerBlock } from "./DividerBlock";
import { BlockWrapper } from "./BlockWrapper";

interface LocalBlock {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order: number;
  isPending: boolean;
}

interface BlockEditorProps {
  pageId: string;
  blocks: Block[];
}

interface SlashMenuState {
  blockId: string;
  filter: string;
  activeIndex: number;
}

function getListIndex(sorted: LocalBlock[], i: number): number {
  const type = sorted[i].type;
  let count = 1;
  for (let j = i - 1; j >= 0; j--) {
    if (sorted[j].type === type) count++;
    else break;
  }
  return count;
}

const INITIAL_BLOCK: LocalBlock = {
  id: "pending-initial",
  type: "TEXT",
  content: { text: "" },
  order: 0,
  isPending: true,
};

function toLocal(b: Block): LocalBlock {
  return { ...b, isPending: false };
}

// Module-level so useDragControls is called at component root, not inside a loop.
function DraggableItem({
  block,
  showSaveButton,
  onSave,
  onFocusBlock,
  onBlurBlock,
  onMoveUp,
  onMoveDown,
  children,
}: {
  block: LocalBlock;
  showSaveButton: boolean;
  onSave: () => void;
  onFocusBlock: () => void;
  onBlurBlock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: React.ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={controls}
      as="div"
      className="outline-none"
    >
      <BlockWrapper
        onDragHandlePointerDown={(e) => controls.start(e)}
        showSaveButton={showSaveButton}
        onSave={onSave}
        onFocusBlock={onFocusBlock}
        onBlurBlock={onBlurBlock}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      >
        {children}
      </BlockWrapper>
    </Reorder.Item>
  );
}

export function BlockEditor({ pageId, blocks: initialBlocks }: BlockEditorProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<LocalBlock[]>(() =>
    initialBlocks.length > 0 ? initialBlocks.map(toLocal) : [INITIAL_BLOCK]
  );
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [dirtyBlockIds, setDirtyBlockIds] = useState<Set<string>>(new Set());

  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // Ref mirror of dirtyBlockIds for synchronous access in callbacks
  const dirtyRef = useRef<Set<string>>(new Set());

  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  const markDirty = (blockId: string) => {
    dirtyRef.current.add(blockId);
    setDirtyBlockIds((prev) => new Set(prev).add(blockId));
  };

  const markClean = (blockId: string) => {
    dirtyRef.current.delete(blockId);
    setDirtyBlockIds((prev) => {
      const s = new Set(prev);
      s.delete(blockId);
      return s;
    });
  };

  const save = async (block: LocalBlock, text: string) => {
    const content = { ...block.content, text };
    if (block.isPending) {
      const res = await fetch(`/api/pages/${pageId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: block.type, content, order: block.order }),
      });
      const { data } = await res.json();
      setBlocks((prev) =>
        prev.map((b) => (b.id === block.id ? { ...b, id: data.id, isPending: false } : b))
      );
      router.refresh();
    } else {
      await fetch(`/api/blocks/${block.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    }
  };

  // saveBlock marks clean synchronously (prevents double-save on blur after Escape),
  // then flushes to the API.
  const saveBlock = async (blockId: string) => {
    const block = blocksRef.current.find((b) => b.id === blockId);
    if (!block) return;
    const text = (block.content.text as string) ?? "";
    markClean(blockId);
    await save(block, text);
  };

  const handleFocus = (blockId: string) => {
    setFocusedBlockId(blockId);
  };

  const handleBlur = (blockId: string) => {
    setFocusedBlockId(null);
    if (dirtyRef.current.has(blockId)) {
      void saveBlock(blockId);
    }
  };

  const handleReorder = (newSorted: LocalBlock[]) => {
    const reordered = newSorted.map((block, idx) => ({ ...block, order: idx }));
    setBlocks(reordered);
    reordered.forEach((block) => {
      if (!block.isPending) {
        void fetch(`/api/blocks/${block.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: block.content, order: block.order }),
        });
      }
    });
  };

  const handleMoveUp = (blockId: string) => {
    const sorted = [...blocksRef.current].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === blockId);
    if (idx <= 0) return;

    const above = sorted[idx - 1];
    const current = sorted[idx];

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === current.id) return { ...b, order: above.order };
        if (b.id === above.id) return { ...b, order: current.order };
        return b;
      })
    );

    if (!current.isPending) {
      void fetch(`/api/blocks/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: current.content, order: above.order }),
      });
    }
    if (!above.isPending) {
      void fetch(`/api/blocks/${above.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: above.content, order: current.order }),
      });
    }
  };

  const handleMoveDown = (blockId: string) => {
    const sorted = [...blocksRef.current].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === blockId);
    if (idx >= sorted.length - 1) return;

    const below = sorted[idx + 1];
    const current = sorted[idx];

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === current.id) return { ...b, order: below.order };
        if (b.id === below.id) return { ...b, order: current.order };
        return b;
      })
    );

    if (!current.isPending) {
      void fetch(`/api/blocks/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: current.content, order: below.order }),
      });
    }
    if (!below.isPending) {
      void fetch(`/api/blocks/${below.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: below.content, order: current.order }),
      });
    }
  };

  const handleChange = (blockId: string, text: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content: { ...b.content, text } } : b))
    );
    markDirty(blockId);

    if (text.startsWith("/")) {
      const filter = text.slice(1).toLowerCase();
      setSlashMenu((prev) =>
        prev?.blockId === blockId
          ? { ...prev, filter, activeIndex: 0 }
          : { blockId, filter, activeIndex: 0 }
      );
    } else {
      setSlashMenu((prev) => (prev?.blockId === blockId ? null : prev));
    }
  };

  const handleKeyDown = (blockId: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMenu?.blockId === blockId) {
      const filtered = getFilteredItems(slashMenu.filter);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashMenu((prev) =>
          prev ? { ...prev, activeIndex: (prev.activeIndex + 1) % filtered.length } : prev
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashMenu((prev) =>
          prev
            ? { ...prev, activeIndex: (prev.activeIndex - 1 + filtered.length) % filtered.length }
            : prev
        );
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[slashMenu.activeIndex];
        if (selected) handleSlashSelect(blockId, selected.type);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setSlashMenu(null);
        setBlocks((prev) =>
          prev.map((b) => (b.id === blockId ? { ...b, content: { ...b.content, text: "" } } : b))
        );
        markClean(blockId);
        return;
      }
    }

    const currentBlockType = blocksRef.current.find((b) => b.id === blockId)?.type;

    if (currentBlockType === "CODE") {
      if (e.key === "Tab") {
        e.preventDefault();
        const block = blocksRef.current.find((b) => b.id === blockId);
        const textarea = textareaRefs.current.get(blockId);
        if (block && textarea) {
          const start = textarea.selectionStart ?? 0;
          const end = textarea.selectionEnd ?? 0;
          const prev = (block.content.text as string) ?? "";
          const newText = prev.slice(0, start) + "  " + prev.slice(end);
          setBlocks((bs) =>
            bs.map((b) =>
              b.id === blockId ? { ...b, content: { ...b.content, text: newText } } : b
            )
          );
          markDirty(blockId);
          requestAnimationFrame(() => {
            const ta = textareaRefs.current.get(blockId);
            if (ta) ta.selectionStart = ta.selectionEnd = start + 2;
          });
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (dirtyRef.current.has(blockId)) {
          void saveBlock(blockId); // markClean runs synchronously inside
        }
        textareaRefs.current.get(blockId)?.blur();
        return;
      }

      if (e.key === "Enter") return; // let browser insert newline
    }

    if (e.key === "Escape") {
      e.preventDefault();
      if (dirtyRef.current.has(blockId)) {
        void saveBlock(blockId); // markClean runs synchronously, prevents double-save on blur
      }
      textareaRefs.current.get(blockId)?.blur();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const sorted = [...blocksRef.current].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.id === blockId);
      const currentBlock = sorted[idx];
      const maxOrder = Math.max(...sorted.map((b) => b.order));
      const newType: BlockType =
        currentBlock?.type === "BULLET_LIST" ||
        currentBlock?.type === "NUMBERED_LIST" ||
        currentBlock?.type === "TODO"
          ? currentBlock.type
          : "TEXT";

      const newBlock: LocalBlock = {
        id: crypto.randomUUID(),
        type: newType,
        content: { text: "" },
        order: maxOrder + 1,
        isPending: true,
      };

      setBlocks([...sorted.slice(0, idx + 1), newBlock, ...sorted.slice(idx + 1)]);

      requestAnimationFrame(() => {
        textareaRefs.current.get(newBlock.id)?.focus();
      });
    }

    if (e.key === "Backspace") {
      const block = blocksRef.current.find((b) => b.id === blockId);
      if (!block) return;
      if ((block.content.text as string) !== "") return;
      if (blocksRef.current.length <= 1) return;

      const sorted = [...blocksRef.current].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.id === blockId);
      const focusTarget = sorted[idx - 1] ?? sorted[idx + 1];

      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      markClean(blockId);

      if (!block.isPending) {
        void fetch(`/api/blocks/${blockId}`, { method: "DELETE" });
      }

      requestAnimationFrame(() => {
        textareaRefs.current.get(focusTarget.id)?.focus();
      });
    }
  };

  const handleSlashSelect = (blockId: string, type: BlockType) => {
    setSlashMenu(null);
    markClean(blockId);

    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, type, content: { text: "" } } : b))
    );

    requestAnimationFrame(() => {
      textareaRefs.current.get(blockId)?.focus();
    });

    const block = blocksRef.current.find((b) => b.id === blockId);
    if (block && !block.isPending) {
      void fetch(`/api/blocks/${blockId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { text: "" }, type }),
      });
    }
  };

  const handleToggle = (blockId: string, checked: boolean) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content: { ...b.content, checked } } : b))
    );
    const block = blocksRef.current.find((b) => b.id === blockId);
    if (block && !block.isPending) {
      void fetch(`/api/blocks/${blockId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { ...block.content, checked } }),
      });
    }
  };

  const handleLanguageChange = (blockId: string, language: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content: { ...b.content, language } } : b))
    );
    markDirty(blockId);
  };

  const handleRef = (blockId: string, el: HTMLTextAreaElement | null) => {
    if (el) {
      textareaRefs.current.set(blockId, el);
    } else {
      textareaRefs.current.delete(blockId);
    }
  };

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <Reorder.Group
      as="div"
      axis="y"
      values={sorted}
      onReorder={handleReorder}
      className="flex flex-col gap-1"
    >
      {sorted.map((block, i) => {
        const slashFilter = slashMenu?.blockId === block.id ? slashMenu.filter : null;
        const slashActiveIndex = slashMenu?.blockId === block.id ? slashMenu.activeIndex : 0;
        const onSlashSelect = (type: BlockType) => handleSlashSelect(block.id, type);
        const showSaveButton = focusedBlockId === block.id && dirtyBlockIds.has(block.id);

        if (block.type === "DIVIDER") {
          return (
            <DraggableItem
              key={block.id}
              block={block}
              showSaveButton={false}
              onSave={() => {}}
              onFocusBlock={() => handleFocus(block.id)}
              onBlurBlock={() => handleBlur(block.id)}
              onMoveUp={() => handleMoveUp(block.id)}
              onMoveDown={() => handleMoveDown(block.id)}
            >
              <DividerBlock
                onEnter={() => {
                  const maxOrder = Math.max(...sorted.map((b) => b.order));
                  const newBlock: LocalBlock = {
                    id: crypto.randomUUID(),
                    type: "TEXT",
                    content: { text: "" },
                    order: maxOrder + 1,
                    isPending: true,
                  };
                  setBlocks([...sorted.slice(0, i + 1), newBlock, ...sorted.slice(i + 1)]);
                  requestAnimationFrame(() => {
                    textareaRefs.current.get(newBlock.id)?.focus();
                  });
                }}
              />
            </DraggableItem>
          );
        }

        if (block.type === "BULLET_LIST" || block.type === "NUMBERED_LIST") {
          return (
            <DraggableItem
              key={block.id}
              block={block}
              showSaveButton={showSaveButton}
              onSave={() => void saveBlock(block.id)}
              onFocusBlock={() => handleFocus(block.id)}
              onBlurBlock={() => handleBlur(block.id)}
              onMoveUp={() => handleMoveUp(block.id)}
              onMoveDown={() => handleMoveDown(block.id)}
            >
              <ListBlock
                blockId={block.id}
                type={block.type}
                text={(block.content.text as string | undefined) ?? ""}
                listIndex={getListIndex(sorted, i)}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onRef={handleRef}
                slashFilter={slashFilter}
                slashActiveIndex={slashActiveIndex}
                onSlashSelect={onSlashSelect}
              />
            </DraggableItem>
          );
        }

        if (block.type === "CODE") {
          return (
            <DraggableItem
              key={block.id}
              block={block}
              showSaveButton={showSaveButton}
              onSave={() => void saveBlock(block.id)}
              onFocusBlock={() => handleFocus(block.id)}
              onBlurBlock={() => handleBlur(block.id)}
              onMoveUp={() => handleMoveUp(block.id)}
              onMoveDown={() => handleMoveDown(block.id)}
            >
              <CodeBlock
                blockId={block.id}
                text={(block.content.text as string | undefined) ?? ""}
                language={(block.content.language as string | undefined) ?? ""}
                onChange={handleChange}
                onLanguageChange={handleLanguageChange}
                onKeyDown={handleKeyDown}
                onRef={handleRef}
                slashFilter={slashFilter}
                slashActiveIndex={slashActiveIndex}
                onSlashSelect={onSlashSelect}
              />
            </DraggableItem>
          );
        }

        if (block.type === "QUOTE") {
          return (
            <DraggableItem
              key={block.id}
              block={block}
              showSaveButton={showSaveButton}
              onSave={() => void saveBlock(block.id)}
              onFocusBlock={() => handleFocus(block.id)}
              onBlurBlock={() => handleBlur(block.id)}
              onMoveUp={() => handleMoveUp(block.id)}
              onMoveDown={() => handleMoveDown(block.id)}
            >
              <QuoteBlock
                blockId={block.id}
                text={(block.content.text as string | undefined) ?? ""}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onRef={handleRef}
                slashFilter={slashFilter}
                slashActiveIndex={slashActiveIndex}
                onSlashSelect={onSlashSelect}
              />
            </DraggableItem>
          );
        }

        if (block.type === "TODO") {
          return (
            <DraggableItem
              key={block.id}
              block={block}
              showSaveButton={showSaveButton}
              onSave={() => void saveBlock(block.id)}
              onFocusBlock={() => handleFocus(block.id)}
              onBlurBlock={() => handleBlur(block.id)}
              onMoveUp={() => handleMoveUp(block.id)}
              onMoveDown={() => handleMoveDown(block.id)}
            >
              <TodoBlock
                blockId={block.id}
                text={(block.content.text as string | undefined) ?? ""}
                checked={(block.content.checked as boolean | undefined) ?? false}
                onChange={handleChange}
                onToggle={handleToggle}
                onKeyDown={handleKeyDown}
                onRef={handleRef}
                slashFilter={slashFilter}
                slashActiveIndex={slashActiveIndex}
                onSlashSelect={onSlashSelect}
              />
            </DraggableItem>
          );
        }

        return (
          <DraggableItem
            key={block.id}
            block={block}
            showSaveButton={showSaveButton}
            onSave={() => void saveBlock(block.id)}
            onFocusBlock={() => handleFocus(block.id)}
            onBlurBlock={() => handleBlur(block.id)}
            onMoveUp={() => handleMoveUp(block.id)}
            onMoveDown={() => handleMoveDown(block.id)}
          >
            <EditableBlock
              block={block}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onRef={handleRef}
              slashFilter={slashFilter}
              slashActiveIndex={slashActiveIndex}
              onSlashSelect={onSlashSelect}
            />
          </DraggableItem>
        );
      })}
    </Reorder.Group>
  );
}

const HEADING_CLASS: Partial<Record<BlockType, string>> = {
  HEADING_1: "text-3xl font-bold",
  HEADING_2: "text-2xl font-semibold",
  HEADING_3: "text-xl font-semibold",
};

function EditableBlock({
  block,
  onChange,
  onKeyDown,
  onRef,
  slashFilter,
  slashActiveIndex,
  onSlashSelect,
}: {
  block: LocalBlock;
  onChange: (id: string, text: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onRef: (id: string, el: HTMLTextAreaElement | null) => void;
  slashFilter: string | null;
  slashActiveIndex: number;
  onSlashSelect: (type: BlockType) => void;
}) {
  const text = (block.content.text as string | undefined) ?? "";
  const typeClass = HEADING_CLASS[block.type] ?? "text-base leading-relaxed";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "0";
    e.target.style.height = `${e.target.scrollHeight}px`;
    onChange(block.id, e.target.value);
  };

  return (
    <div className="relative">
      <textarea
        ref={(el) => onRef(block.id, el)}
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => onKeyDown(block.id, e)}
        placeholder="Type something…"
        rows={1}
        className={`w-full bg-transparent resize-none outline-none overflow-hidden text-text-primary ${typeClass}`}
      />
      {slashFilter !== null && (
        <SlashMenu
          filter={slashFilter}
          activeIndex={slashActiveIndex}
          onSelect={onSlashSelect}
        />
      )}
    </div>
  );
}
