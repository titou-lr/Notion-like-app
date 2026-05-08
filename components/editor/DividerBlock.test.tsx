import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DividerBlock } from "./DividerBlock";

describe("DividerBlock", () => {
  it("renders a horizontal rule with role separator", () => {
    render(<DividerBlock onEnter={vi.fn()} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("is focusable via tabIndex", () => {
    const { container } = render(<DividerBlock onEnter={vi.fn()} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute("tabindex", "0");
  });

  it("calls onEnter when Enter key is pressed", () => {
    const onEnter = vi.fn();
    const { container } = render(<DividerBlock onEnter={onEnter} />);
    fireEvent.keyDown(container.firstChild!, { key: "Enter" });
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("does not call onEnter when other keys are pressed", () => {
    const onEnter = vi.fn();
    const { container } = render(<DividerBlock onEnter={onEnter} />);
    fireEvent.keyDown(container.firstChild!, { key: "ArrowDown" });
    fireEvent.keyDown(container.firstChild!, { key: "Backspace" });
    expect(onEnter).not.toHaveBeenCalled();
  });

  it("does not render any textarea", () => {
    render(<DividerBlock onEnter={vi.fn()} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
