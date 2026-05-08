import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SlashMenu } from "./SlashMenu";

describe("SlashMenu", () => {
  it("renders all 10 block types when filter is empty", () => {
    render(<SlashMenu filter="" activeIndex={0} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("option")).toHaveLength(10);
  });

  it("shows only matching items when filter is set", () => {
    render(<SlashMenu filter="head" activeIndex={0} onSelect={vi.fn()} />);
    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(3);
    expect(screen.getByText("Heading 1")).toBeInTheDocument();
    expect(screen.getByText("Heading 2")).toBeInTheDocument();
    expect(screen.getByText("Heading 3")).toBeInTheDocument();
  });

  it("shows 'No results' when filter matches nothing", () => {
    render(<SlashMenu filter="zzz" activeIndex={0} onSelect={vi.fn()} />);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("marks the item at activeIndex as selected via aria-selected", () => {
    render(<SlashMenu filter="" activeIndex={2} onSelect={vi.fn()} />);
    const items = screen.getAllByRole("option");
    expect(items[2]).toHaveAttribute("aria-selected", "true");
    expect(items[0]).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelect with the item's BlockType when clicked", () => {
    const onSelect = vi.fn();
    render(<SlashMenu filter="" activeIndex={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Heading 1"));
    expect(onSelect).toHaveBeenCalledWith("HEADING_1");
  });
});
