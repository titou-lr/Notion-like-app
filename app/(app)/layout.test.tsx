import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}));

vi.mock("@/lib/data/pages", () => ({
  getUserPages: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/components/sidebar/Sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
      <div onClick={onClick}>{children}</div>
    ),
    aside: ({ children }: { children?: React.ReactNode }) => <aside>{children}</aside>,
  },
}));

import AppLayout from "./layout";

describe("AppLayout", () => {
  it("renders children in the main content area", async () => {
    const jsx = await AppLayout({ children: <div>Page content</div> });
    render(jsx);
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("renders the sidebar region", async () => {
    const jsx = await AppLayout({ children: <div>content</div> });
    render(jsx);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("renders the main region", async () => {
    const jsx = await AppLayout({ children: <div>content</div> });
    render(jsx);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
