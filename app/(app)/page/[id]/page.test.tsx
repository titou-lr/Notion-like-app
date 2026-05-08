import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockGetPage } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetPage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock("@/lib/data/pages", () => ({
  getPage: mockGetPage,
}));

vi.mock("@/components/editor/BlockEditor", () => ({
  BlockEditor: () => <div data-testid="block-editor" />,
}));

vi.mock("@/components/editor/PageIcon", () => ({
  PageIcon: () => <div data-testid="page-icon" />,
}));

import PageView from "./page";

describe("PageView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    mockGetPage.mockResolvedValue({ id: "page-1", title: "My Page", icon: null, blocks: [] });

    const jsx = await PageView({ params: { id: "page-1" } });
    render(jsx);

    expect(screen.getByText("My Page")).toBeInTheDocument();
  });

  it("renders 'Untitled' when the title is empty", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    mockGetPage.mockResolvedValue({ id: "page-1", title: "", icon: null, blocks: [] });

    const jsx = await PageView({ params: { id: "page-1" } });
    render(jsx);

    expect(screen.getByText("Untitled")).toBeInTheDocument();
  });

  it("calls notFound when the page does not exist", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    mockGetPage.mockResolvedValue(null);

    await expect(PageView({ params: { id: "nonexistent" } })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
  });

  it("calls notFound when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(PageView({ params: { id: "page-1" } })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
  });
});
