import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuoteBlock } from "./QuoteBlock";

const defaultProps = {
  blockId: "q1",
  text: "To be or not to be",
  onChange: vi.fn(),
  onKeyDown: vi.fn(),
  onRef: vi.fn(),
  slashFilter: null as null,
  slashActiveIndex: 0,
  onSlashSelect: vi.fn(),
};

describe("QuoteBlock", () => {
  it("renders the text content in a textarea", () => {
    render(<QuoteBlock {...defaultProps} />);
    expect(screen.getByDisplayValue("To be or not to be")).toBeInTheDocument();
  });

  it("applies italic style to the textarea", () => {
    render(<QuoteBlock {...defaultProps} />);
    expect(screen.getByRole("textbox")).toHaveClass("italic");
  });

  it("renders a left border accent", () => {
    const { container } = render(<QuoteBlock {...defaultProps} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/border-l/);
  });

  it("renders the placeholder 'Quote…'", () => {
    render(<QuoteBlock {...defaultProps} text="" />);
    expect(screen.getByPlaceholderText("Quote…")).toBeInTheDocument();
  });

  it("calls onChange with blockId and new text when typing", () => {
    const onChange = vi.fn();
    render(<QuoteBlock {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "All the world's a stage" } });
    expect(onChange).toHaveBeenCalledWith("q1", "All the world's a stage");
  });

  it("calls onKeyDown with blockId and event when a key is pressed", () => {
    const onKeyDown = vi.fn();
    render(<QuoteBlock {...defaultProps} onKeyDown={onKeyDown} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalledWith("q1", expect.objectContaining({ key: "Enter" }));
  });

  it("renders the slash menu when slashFilter is not null", () => {
    render(<QuoteBlock {...defaultProps} slashFilter="" slashActiveIndex={0} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("does not render the slash menu when slashFilter is null", () => {
    render(<QuoteBlock {...defaultProps} slashFilter={null} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
