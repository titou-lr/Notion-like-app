import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

const defaultProps = {
  blockId: "c1",
  text: "const x = 1;",
  language: "typescript",
  onChange: vi.fn(),
  onLanguageChange: vi.fn(),
  onKeyDown: vi.fn(),
  onRef: vi.fn(),
  slashFilter: null as null,
  slashActiveIndex: 0,
  onSlashSelect: vi.fn(),
};

describe("CodeBlock", () => {
  it("renders the code text in a textarea", () => {
    render(<CodeBlock {...defaultProps} />);
    expect(screen.getByDisplayValue("const x = 1;")).toBeInTheDocument();
  });

  it("applies monospace font class to the code textarea", () => {
    render(<CodeBlock {...defaultProps} />);
    expect(screen.getByDisplayValue("const x = 1;")).toHaveClass("font-mono");
  });

  it("renders the language in an input field", () => {
    render(<CodeBlock {...defaultProps} language="python" />);
    expect(screen.getByDisplayValue("python")).toBeInTheDocument();
  });

  it("shows 'Plain text' placeholder when language is empty", () => {
    render(<CodeBlock {...defaultProps} language="" />);
    expect(screen.getByPlaceholderText("Plain text")).toBeInTheDocument();
  });

  it("calls onChange with blockId and new text when code is typed", () => {
    const onChange = vi.fn();
    render(<CodeBlock {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue("const x = 1;"), {
      target: { value: "const x = 2;" },
    });
    expect(onChange).toHaveBeenCalledWith("c1", "const x = 2;");
  });

  it("calls onLanguageChange with blockId and new language when language is typed", () => {
    const onLanguageChange = vi.fn();
    render(<CodeBlock {...defaultProps} onLanguageChange={onLanguageChange} />);
    fireEvent.change(screen.getByDisplayValue("typescript"), {
      target: { value: "python" },
    });
    expect(onLanguageChange).toHaveBeenCalledWith("c1", "python");
  });

  it("calls onKeyDown with blockId and event when a key is pressed in the code area", () => {
    const onKeyDown = vi.fn();
    render(<CodeBlock {...defaultProps} onKeyDown={onKeyDown} />);
    fireEvent.keyDown(screen.getByDisplayValue("const x = 1;"), { key: "Tab" });
    expect(onKeyDown).toHaveBeenCalledWith("c1", expect.objectContaining({ key: "Tab" }));
  });

  it("renders the slash menu when slashFilter is not null", () => {
    render(<CodeBlock {...defaultProps} slashFilter="" slashActiveIndex={0} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
