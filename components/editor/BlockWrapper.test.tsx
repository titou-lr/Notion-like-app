import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BlockWrapper } from "./BlockWrapper";

const defaultProps = {
  onActivateDrag: vi.fn(),
  isLifted: false,
  showSaveButton: false,
  onSave: vi.fn(),
  onFocusBlock: vi.fn(),
  onBlurBlock: vi.fn(),
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

  it("does not render a visible drag handle button", () => {
    render(
      <BlockWrapper {...defaultProps}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(screen.queryByRole("button", { name: /drag to reorder/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /move block/i })).not.toBeInTheDocument();
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
