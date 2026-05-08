import { describe, it, expect } from "vitest";
import { isProtectedRoute } from "./middleware";

describe("isProtectedRoute", () => {
  it("returns false for /login", () => {
    expect(isProtectedRoute("/login")).toBe(false);
  });

  it("returns false for /signup", () => {
    expect(isProtectedRoute("/signup")).toBe(false);
  });

  it("returns true for /", () => {
    expect(isProtectedRoute("/")).toBe(true);
  });

  it("returns true for a page route", () => {
    expect(isProtectedRoute("/page/abc123")).toBe(true);
  });
});
