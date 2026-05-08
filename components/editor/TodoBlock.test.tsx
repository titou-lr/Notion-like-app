import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TodoBlock } from "./TodoBlock";

const defaultProps = {
  blockId: "t1",
  text: "Do the thing",
  checked: false,
  onChange: vi.fn(),
  onToggle: vi.fn(),
  onKeyDown: vi.fn(),
  onRef: vi.fn(),
  slashFilter: null as null,
  slashActiveIndex: 0,
  onSlashSelect: vi.fn(),
};

describe("TodoBlock", () => {
  it("renders the text content in a textarea", () => {
    render(<TodoBlock {...defaultProps} />);
    expect(screen.getByDisplayValue("Do the thing")).toBeInTheDocument();
  });

  it("renders a checkbox input", () => {
    render(<TodoBlock {...defaultProps} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders unchecked when checked is false", () => {
    render(<TodoBlock {...defaultProps} checked={false} />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders checked when checked is true", () => {
    render(<TodoBlock {...defaultProps} checked={true} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("applies line-through style to the textarea when checked", () => {
    render(<TodoBlock {...defaultProps} checked={true} />);
    expect(screen.getByRole("textbox")).toHaveClass("line-through");
  });

  it("does not apply line-through style when unchecked", () => {
    render(<TodoBlock {...defaultProps} checked={false} />);
    expect(screen.getByRole("textbox")).not.toHaveClass("line-through");
  });

  it("calls onToggle with blockId and new checked state when checkbox is clicked", () => {
    const onToggle = vi.fn();
    render(<TodoBlock {...defaultProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("t1", true);
  });

  it("calls onToggle with false when an already-checked item is clicked", () => {
    const onToggle = vi.fn();
    render(<TodoBlock {...defaultProps} checked={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("t1", false);
  });

  it("calls onChange with blockId and new text when typing", () => {
    const onChange = vi.fn();
    render(<TodoBlock {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "updated" } });
    expect(onChange).toHaveBeenCalledWith("t1", "updated");
  });

  it("calls onKeyDown with blockId and event when a key is pressed", () => {
    const onKeyDown = vi.fn();
    render(<TodoBlock {...defaultProps} onKeyDown={onKeyDown} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalledWith("t1", expect.objectContaining({ key: "Enter" }));
  });

  it("renders the slash menu when slashFilter is not null", () => {
    render(<TodoBlock {...defaultProps} slashFilter="" slashActiveIndex={0} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
