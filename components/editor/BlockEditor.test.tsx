import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BlockEditor } from "./BlockEditor";
import type { Block } from "@/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("framer-motion", () => ({
  Reorder: {
    Group: ({
      children,
      onReorder,
      values,
      className,
    }: {
      children: React.ReactNode;
      onReorder: (v: unknown[]) => void;
      values: unknown[];
      className?: string;
      as?: string;
      axis?: string;
    }) => (
      <div className={className}>
        <button
          data-testid="trigger-reorder"
          onClick={() => onReorder([...(values as unknown[])].reverse())}
        >
          reorder
        </button>
        {children}
      </div>
    ),
    Item: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      value?: unknown;
      dragListener?: boolean;
      dragControls?: unknown;
      as?: string;
      className?: string;
    }) => <div className={className}>{children}</div>,
  },
  useDragControls: () => ({ start: vi.fn() }),
}));

const block = (overrides: Partial<Block> & { type: Block["type"] }): Block => ({
  id: "1",
  content: {},
  order: 0,
  ...overrides,
});

describe("BlockEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({}) }));
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("shows a single empty textarea when no blocks are provided", () => {
    render(<BlockEditor pageId="page-1" blocks={[]} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders a TEXT block's content in a textarea", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TEXT", content: { text: "Hello world" } })]}
      />
    );
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
  });

  it("renders HEADING_1 content in an editable textarea", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "HEADING_1", content: { text: "Big Title" } })]}
      />
    );
    expect(screen.getByDisplayValue("Big Title")).toBeInTheDocument();
  });

  it("renders a DIVIDER block as a separator", () => {
    render(<BlockEditor pageId="page-1" blocks={[block({ type: "DIVIDER" })]} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("renders blocks sorted by their order field", () => {
    const blocks: Block[] = [
      block({ id: "2", type: "TEXT", content: { text: "Second" }, order: 1 }),
      block({ id: "1", type: "TEXT", content: { text: "First" }, order: 0 }),
    ];
    const { container } = render(<BlockEditor pageId="page-1" blocks={blocks} />);
    const text = container.textContent!;
    expect(text.indexOf("First")).toBeLessThan(text.indexOf("Second"));
  });

  it("updates the displayed value when the user types", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    const textarea = screen.getByDisplayValue("Hello");
    fireEvent.change(textarea, { target: { value: "Hello World" } });
    expect(screen.getByDisplayValue("Hello World")).toBeInTheDocument();
  });

  // — Save button & blur-based save —

  it("shows a save button when a block is focused and has unsaved changes", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "b1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    const textarea = screen.getByDisplayValue("Hello");
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "Hello World" } });
    expect(screen.getByRole("button", { name: /save block/i })).toBeInTheDocument();
  });

  it("does not show save button when block has no unsaved changes", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "b1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    fireEvent.focus(screen.getByDisplayValue("Hello"));
    expect(screen.queryByRole("button", { name: /save block/i })).not.toBeInTheDocument();
  });

  it("does not call fetch during typing — save is deferred", () => {
    const mockFetch = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "block-1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    fireEvent.focus(screen.getByDisplayValue("Hello"));
    fireEvent.change(screen.getByDisplayValue("Hello"), { target: { value: "Hello World" } });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls PATCH when an existing block is blurred with unsaved changes", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "block-1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    const textarea = screen.getByDisplayValue("Hello");
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "Hello World" } });
    fireEvent.blur(textarea);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/blocks/block-1",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("calls POST when a pending block is blurred with content", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ data: { id: "real-block-id" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<BlockEditor pageId="page-1" blocks={[]} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "New content" } });
    fireEvent.blur(textarea);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/pages/page-1/blocks",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("save button disappears after blur (block is saved and marked clean)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "b1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    const textarea = screen.getByDisplayValue("Hello");
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "Hello World" } });
    expect(screen.getByRole("button", { name: /save block/i })).toBeInTheDocument();

    fireEvent.blur(textarea);
    expect(screen.queryByRole("button", { name: /save block/i })).not.toBeInTheDocument();
  });

  it("pressing Escape on a TEXT block triggers save and removes the save button", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "b1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    const textarea = screen.getByDisplayValue("Hello");
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "Hello World" } });

    fireEvent.keyDown(textarea, { key: "Escape" });

    expect(screen.queryByRole("button", { name: /save block/i })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/blocks/b1",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  // — Block creation / deletion —

  it("pressing Enter creates a new block below the current one", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "b1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    fireEvent.keyDown(screen.getByDisplayValue("Hello"), { key: "Enter" });
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
  });

  it("pressing Backspace on an empty block removes it", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[
          block({ id: "b1", type: "TEXT", content: { text: "Hello" }, order: 0 }),
          block({ id: "b2", type: "TEXT", content: { text: "" }, order: 1 }),
        ]}
      />
    );
    fireEvent.keyDown(screen.getByDisplayValue(""), { key: "Backspace" });
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });

  it("pressing Backspace on a non-empty block does not remove it", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "b1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    fireEvent.keyDown(screen.getByDisplayValue("Hello"), { key: "Backspace" });
    expect(screen.getByDisplayValue("Hello")).toBeInTheDocument();
  });

  it("does not remove the last block on Backspace even when empty", () => {
    render(<BlockEditor pageId="page-1" blocks={[]} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Backspace" });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls DELETE when Backspace removes a persisted block", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({}) }));

    render(
      <BlockEditor
        pageId="page-1"
        blocks={[
          block({ id: "b1", type: "TEXT", content: { text: "Hello" }, order: 0 }),
          block({ id: "b2", type: "TEXT", content: { text: "" }, order: 1 }),
        ]}
      />
    );
    fireEvent.keyDown(screen.getByDisplayValue(""), { key: "Backspace" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/blocks/b2",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  // — TODO blocks —

  it("renders a TODO block with a checkbox", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TODO", content: { text: "Buy milk", checked: false } })]}
      />
    );
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Buy milk")).toBeInTheDocument();
  });

  it("renders a checked TODO block with line-through text style", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TODO", content: { text: "Done task", checked: true } })]}
      />
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByRole("textbox")).toHaveClass("line-through");
  });

  it("pressing Enter on a TODO block creates another TODO block", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "t1", type: "TODO", content: { text: "Task" } })]}
      />
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("toggling a checkbox on a persisted TODO block calls PATCH", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "t1", type: "TODO", content: { text: "Task", checked: false } })]}
      />
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(fetch).toHaveBeenCalledWith(
      "/api/blocks/t1",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  // — CODE blocks —

  it("renders a CODE block with a language input and code textarea", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "c1", type: "CODE", content: { text: "const x = 1;", language: "typescript" } })]}
      />
    );
    expect(screen.getByDisplayValue("const x = 1;")).toBeInTheDocument();
    expect(screen.getByDisplayValue("typescript")).toBeInTheDocument();
  });

  it("pressing Enter in a CODE block does not create a new block", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "c1", type: "CODE", content: { text: "const x = 1;" } })]}
      />
    );
    const codeTextarea = screen.getByDisplayValue("const x = 1;");
    const countBefore = screen.getAllByRole("textbox").length;
    fireEvent.keyDown(codeTextarea, { key: "Enter" });
    expect(screen.getAllByRole("textbox")).toHaveLength(countBefore);
  });

  it("pressing Tab in a CODE block inserts 2 spaces at the cursor position", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "c1", type: "CODE", content: { text: "code" } })]}
      />
    );
    const textarea = screen.getByDisplayValue("code") as HTMLTextAreaElement;
    Object.defineProperty(textarea, "selectionStart", { get: () => 0, configurable: true });
    Object.defineProperty(textarea, "selectionEnd", { get: () => 0, configurable: true });
    fireEvent.keyDown(textarea, { key: "Tab" });
    expect(textarea.value).toBe("  code");
  });

  it("pressing Escape in a CODE block blurs without creating a new block", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "c1", type: "CODE", content: { text: "const x = 1;" } })]}
      />
    );
    const codeTextarea = screen.getByDisplayValue("const x = 1;");
    const countBefore = screen.getAllByRole("textbox").length;
    fireEvent.keyDown(codeTextarea, { key: "Escape" });
    expect(screen.getAllByRole("textbox")).toHaveLength(countBefore);
  });

  // — Slash menu —

  it("typing '/' opens the slash menu", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TEXT", content: { text: "" } })]}
      />
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "/" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("typing '/he' filters the slash menu to headings only", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TEXT", content: { text: "" } })]}
      />
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "/he" } });
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("pressing Escape closes the slash menu and clears the block text", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TEXT", content: { text: "" } })]}
      />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "/" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(textarea, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("ArrowDown moves the slash menu selection to the next item", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TEXT", content: { text: "" } })]}
      />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "/" } });
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    const items = screen.getAllByRole("option");
    expect(items[1]).toHaveAttribute("aria-selected", "true");
  });

  it("pressing Enter when slash menu is open selects the active item and closes the menu", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "TEXT", content: { text: "" } })]}
      />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "/head" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  // — List blocks —

  it("renders a BULLET_LIST block with a bullet prefix", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "BULLET_LIST", content: { text: "Item" } })]}
      />
    );
    expect(screen.getByDisplayValue("Item")).toBeInTheDocument();
    expect(screen.getByText("•")).toBeInTheDocument();
  });

  it("renders NUMBERED_LIST blocks with sequential numbers", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[
          block({ id: "n1", type: "NUMBERED_LIST", content: { text: "First" }, order: 0 }),
          block({ id: "n2", type: "NUMBERED_LIST", content: { text: "Second" }, order: 1 }),
        ]}
      />
    );
    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
  });

  it("pressing Enter on a BULLET_LIST block creates another BULLET_LIST block", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "b1", type: "BULLET_LIST", content: { text: "Item" } })]}
      />
    );
    fireEvent.keyDown(screen.getByDisplayValue("Item"), { key: "Enter" });
    expect(screen.getAllByText("•")).toHaveLength(2);
  });

  it("pressing Enter on a NUMBERED_LIST block creates a new item with the next number", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "n1", type: "NUMBERED_LIST", content: { text: "Item" } })]}
      />
    );
    fireEvent.keyDown(screen.getByDisplayValue("Item"), { key: "Enter" });
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(screen.getByText("2.")).toBeInTheDocument();
  });

  it("renders a QUOTE block with italic styling", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ type: "QUOTE", content: { text: "Famous words" } })]}
      />
    );
    expect(screen.getByDisplayValue("Famous words")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass("italic");
  });

  it("pressing Enter on a QUOTE block creates a TEXT block (not another QUOTE)", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "q1", type: "QUOTE", content: { text: "A quote" } })]}
      />
    );
    fireEvent.keyDown(screen.getByDisplayValue("A quote"), { key: "Enter" });
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes).toHaveLength(2);
    expect(textboxes[1]).not.toHaveClass("italic");
  });

  it("pressing Enter on a DIVIDER block creates a new TEXT block below", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "d1", type: "DIVIDER" })]}
      />
    );
    const separator = screen.getByRole("separator");
    fireEvent.keyDown(separator.parentElement!, { key: "Enter" });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // — Reorder —

  it("calls PATCH with the new order for all non-pending blocks after reorder", () => {
    const mockFetch = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <BlockEditor
        pageId="page-1"
        blocks={[
          block({ id: "b1", type: "TEXT", content: { text: "First" }, order: 0 }),
          block({ id: "b2", type: "TEXT", content: { text: "Second" }, order: 1 }),
        ]}
      />
    );

    fireEvent.click(screen.getByTestId("trigger-reorder"));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/blocks/b2",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining('"order":0'),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/blocks/b1",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining('"order":1'),
      })
    );
  });

  it("displays blocks in the new order after reorder", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[
          block({ id: "b1", type: "TEXT", content: { text: "First" }, order: 0 }),
          block({ id: "b2", type: "TEXT", content: { text: "Second" }, order: 1 }),
        ]}
      />
    );

    fireEvent.click(screen.getByTestId("trigger-reorder"));

    const textareas = screen.getAllByRole("textbox");
    expect(textareas[0]).toHaveValue("Second");
    expect(textareas[1]).toHaveValue("First");
  });

  // — Mobile move up/down —

  it("renders move-up and move-down buttons for each block", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[block({ id: "b1", type: "TEXT", content: { text: "Hello" } })]}
      />
    );
    expect(screen.getByRole("button", { name: /move block up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move block down/i })).toBeInTheDocument();
  });

  it("clicking move up swaps the block with the one above it", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[
          block({ id: "b1", type: "TEXT", content: { text: "First" }, order: 0 }),
          block({ id: "b2", type: "TEXT", content: { text: "Second" }, order: 1 }),
        ]}
      />
    );
    const moveUpButtons = screen.getAllByRole("button", { name: /move block up/i });
    fireEvent.click(moveUpButtons[1]); // move "Second" up
    const textareas = screen.getAllByRole("textbox");
    expect(textareas[0]).toHaveValue("Second");
    expect(textareas[1]).toHaveValue("First");
  });

  it("clicking move down swaps the block with the one below it", () => {
    render(
      <BlockEditor
        pageId="page-1"
        blocks={[
          block({ id: "b1", type: "TEXT", content: { text: "First" }, order: 0 }),
          block({ id: "b2", type: "TEXT", content: { text: "Second" }, order: 1 }),
        ]}
      />
    );
    const moveDownButtons = screen.getAllByRole("button", { name: /move block down/i });
    fireEvent.click(moveDownButtons[0]); // move "First" down
    const textareas = screen.getAllByRole("textbox");
    expect(textareas[0]).toHaveValue("Second");
    expect(textareas[1]).toHaveValue("First");
  });

  it("move up calls PATCH for both swapped blocks with new orders", () => {
    const mockFetch = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <BlockEditor
        pageId="page-1"
        blocks={[
          block({ id: "b1", type: "TEXT", content: { text: "First" }, order: 0 }),
          block({ id: "b2", type: "TEXT", content: { text: "Second" }, order: 1 }),
        ]}
      />
    );
    const moveUpButtons = screen.getAllByRole("button", { name: /move block up/i });
    fireEvent.click(moveUpButtons[1]);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/blocks/b2",
      expect.objectContaining({ method: "PATCH", body: expect.stringContaining('"order":0') })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/blocks/b1",
      expect.objectContaining({ method: "PATCH", body: expect.stringContaining('"order":1') })
    );
  });
});
