import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BlockWrapper } from "./BlockWrapper";

describe("BlockWrapper", () => {
  it("renders children inside the wrapper", () => {
    render(
      <BlockWrapper onDragHandlePointerDown={vi.fn()}>
        <span>block content</span>
      </BlockWrapper>
    );
    expect(screen.getByText("block content")).toBeInTheDocument();
  });

  it("renders a drag handle button with accessible label", () => {
    render(
      <BlockWrapper onDragHandlePointerDown={vi.fn()}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(screen.getByRole("button", { name: /drag to reorder/i })).toBeInTheDocument();
  });

  it("drag handle is initially hidden via opacity-0 class", () => {
    render(
      <BlockWrapper onDragHandlePointerDown={vi.fn()}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(screen.getByRole("button", { name: /drag to reorder/i })).toHaveClass("opacity-0");
  });

  it("calls onDragHandlePointerDown when the handle receives a pointer down event", () => {
    const handler = vi.fn();
    render(
      <BlockWrapper onDragHandlePointerDown={handler}>
        <span>content</span>
      </BlockWrapper>
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: /drag to reorder/i }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders the grip icon inside the drag handle", () => {
    const { container } = render(
      <BlockWrapper onDragHandlePointerDown={vi.fn()}>
        <span>content</span>
      </BlockWrapper>
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
