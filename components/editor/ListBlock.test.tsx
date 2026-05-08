import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ListBlock } from "./ListBlock";

const defaultProps = {
  blockId: "b1",
  text: "List item",
  listIndex: 1,
  onChange: vi.fn(),
  onKeyDown: vi.fn(),
  onRef: vi.fn(),
  slashFilter: null as null,
  slashActiveIndex: 0,
  onSlashSelect: vi.fn(),
};

describe("ListBlock", () => {
  it("renders the text content in a textarea", () => {
    render(<ListBlock type="BULLET_LIST" {...defaultProps} />);
    expect(screen.getByDisplayValue("List item")).toBeInTheDocument();
  });

  it("shows a bullet prefix for BULLET_LIST", () => {
    render(<ListBlock type="BULLET_LIST" {...defaultProps} />);
    expect(screen.getByText("•")).toBeInTheDocument();
  });

  it("shows the list index as prefix for NUMBERED_LIST", () => {
    render(<ListBlock type="NUMBERED_LIST" {...defaultProps} listIndex={3} />);
    expect(screen.getByText("3.")).toBeInTheDocument();
  });

  it("calls onChange with blockId and new text when the user types", () => {
    const onChange = vi.fn();
    render(<ListBlock type="BULLET_LIST" {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "updated" } });
    expect(onChange).toHaveBeenCalledWith("b1", "updated");
  });

  it("calls onKeyDown with blockId and event when a key is pressed", () => {
    const onKeyDown = vi.fn();
    render(<ListBlock type="BULLET_LIST" {...defaultProps} onKeyDown={onKeyDown} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalledWith("b1", expect.objectContaining({ key: "Enter" }));
  });

  it("renders the slash menu when slashFilter is not null", () => {
    render(<ListBlock type="BULLET_LIST" {...defaultProps} slashFilter="" slashActiveIndex={0} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
