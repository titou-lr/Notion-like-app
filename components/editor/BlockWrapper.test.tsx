import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BlockWrapper } from "./BlockWrapper";

const defaultProps = {
  onDragHandlePointerDown: vi.fn(),
  showSaveButton: false,
  onSave: vi.fn(),
  onFocusBlock: vi.fn(),
  onBlurBlock: vi.fn(),
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
};

describe("BlockWrapper", () => {
  it("renders children inside the wrapper", () => {
    render(
      <BlockWrapper {...defaultProps}>
        <span>block content</span>
      </BlockWrapper>
    );
    expect(screen.getByText("block content")).toBeInTheDocument();
  });

  it("renders a drag handle button with accessible label", () => {
    render(
      <BlockWrapper {...defaultProps}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(screen.getByRole("button", { name: /drag to reorder/i })).toBeInTheDocument();
  });

  it("drag handle has opacity-0 class", () => {
    render(
      <BlockWrapper {...defaultProps}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(screen.getByRole("button", { name: /drag to reorder/i })).toHaveClass("opacity-0");
  });

  it("calls onDragHandlePointerDown when the handle receives a pointer down event", () => {
    const handler = vi.fn();
    render(
      <BlockWrapper {...defaultProps} onDragHandlePointerDown={handler}>
        <span>content</span>
      </BlockWrapper>
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: /drag to reorder/i }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders the grip icon svg inside the drag handle", () => {
    const { container } = render(
      <BlockWrapper {...defaultProps}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders up and down move buttons", () => {
    render(
      <BlockWrapper {...defaultProps}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(screen.getByRole("button", { name: /move block up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move block down/i })).toBeInTheDocument();
  });

  it("calls onMoveUp when the up arrow button is clicked", () => {
    const onMoveUp = vi.fn();
    render(
      <BlockWrapper {...defaultProps} onMoveUp={onMoveUp}>
        <span>content</span>
      </BlockWrapper>
    );
    fireEvent.click(screen.getByRole("button", { name: /move block up/i }));
    expect(onMoveUp).toHaveBeenCalledTimes(1);
  });

  it("calls onMoveDown when the down arrow button is clicked", () => {
    const onMoveDown = vi.fn();
    render(
      <BlockWrapper {...defaultProps} onMoveDown={onMoveDown}>
        <span>content</span>
      </BlockWrapper>
    );
    fireEvent.click(screen.getByRole("button", { name: /move block down/i }));
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });

  it("does not show the save button when showSaveButton is false", () => {
    render(
      <BlockWrapper {...defaultProps} showSaveButton={false}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(screen.queryByRole("button", { name: /save block/i })).not.toBeInTheDocument();
  });

  it("shows the save button when showSaveButton is true", () => {
    render(
      <BlockWrapper {...defaultProps} showSaveButton={true}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(screen.getByRole("button", { name: /save block/i })).toBeInTheDocument();
  });

  it("calls onSave when the save button is mouse-downed", () => {
    const onSave = vi.fn();
    render(
      <BlockWrapper {...defaultProps} showSaveButton={true} onSave={onSave}>
        <span>content</span>
      </BlockWrapper>
    );
    fireEvent.mouseDown(screen.getByRole("button", { name: /save block/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onFocusBlock when a child element is focused", () => {
    const onFocusBlock = vi.fn();
    render(
      <BlockWrapper {...defaultProps} onFocusBlock={onFocusBlock}>
        <input data-testid="child-input" />
      </BlockWrapper>
    );
    fireEvent.focus(screen.getByTestId("child-input"));
    expect(onFocusBlock).toHaveBeenCalledTimes(1);
  });

  it("calls onBlurBlock when focus leaves the wrapper entirely", () => {
    const onBlurBlock = vi.fn();
    render(
      <BlockWrapper {...defaultProps} onBlurBlock={onBlurBlock}>
        <input data-testid="child-input" />
      </BlockWrapper>
    );
    fireEvent.focus(screen.getByTestId("child-input"));
    fireEvent.blur(screen.getByTestId("child-input"));
    expect(onBlurBlock).toHaveBeenCalledTimes(1);
  });
});
