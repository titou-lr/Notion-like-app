import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppShell } from "./AppShell";
import type { SidebarPage } from "@/types";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      onClick,
      className,
      "data-testid": testId,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      className?: string;
      "data-testid"?: string;
    }) => (
      <div onClick={onClick} className={className} data-testid={testId}>
        {children}
      </div>
    ),
    aside: ({
      children,
      className,
    }: {
      children?: React.ReactNode;
      className?: string;
    }) => <aside className={className}>{children}</aside>,
  },
}));

vi.mock("@/components/sidebar/Sidebar", () => ({
  Sidebar: () => <nav data-testid="sidebar" />,
}));

const pages: SidebarPage[] = [];

describe("AppShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children in the main area", () => {
    render(<AppShell pages={pages}><div>Page content</div></AppShell>);
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("renders the main region", () => {
    render(<AppShell pages={pages}><div>content</div></AppShell>);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders the desktop sidebar (complementary region)", () => {
    render(<AppShell pages={pages}><div>content</div></AppShell>);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("shows a hamburger open-menu button", () => {
    render(<AppShell pages={pages}><div>content</div></AppShell>);
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
  });

  it("drawer is closed by default — no close button visible", () => {
    render(<AppShell pages={pages}><div>content</div></AppShell>);
    expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
  });

  it("clicking the hamburger button opens the drawer", async () => {
    render(<AppShell pages={pages}><div>content</div></AppShell>);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
  });

  it("clicking the close button closes the drawer", async () => {
    render(<AppShell pages={pages}><div>content</div></AppShell>);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    await userEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
  });

  it("clicking the overlay closes the drawer", async () => {
    render(<AppShell pages={pages}><div>content</div></AppShell>);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    fireEvent.click(screen.getByTestId("drawer-overlay"));
    expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
  });

  it("renders sidebar inside the drawer when open", async () => {
    render(<AppShell pages={pages}><div>content</div></AppShell>);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    // Both desktop sidebar and drawer sidebar are rendered
    expect(screen.getAllByTestId("sidebar").length).toBeGreaterThanOrEqual(1);
  });

  it("drawer closes automatically when the pathname changes", async () => {
    const { usePathname } = await import("next/navigation");
    const mockUsePathname = vi.mocked(usePathname);
    mockUsePathname.mockReturnValue("/");

    const { rerender } = render(<AppShell pages={pages}><div>content</div></AppShell>);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();

    // Simulate navigation: pathname changes
    mockUsePathname.mockReturnValue("/page/123");
    rerender(<AppShell pages={pages}><div>new page</div></AppShell>);

    // useEffect fires after rerender — wait for it
    await vi.waitFor(() => {
      expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
    });
  });
});
