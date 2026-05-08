"use client";

import { useEffect } from "react";
import { applyWallpaper, WALLPAPER_STORAGE_KEY } from "@/lib/wallpaper";

export function WallpaperInit() {
  useEffect(() => {
    const stored = localStorage.getItem(WALLPAPER_STORAGE_KEY);
    if (stored) applyWallpaper(stored);
  }, []);

  return null;
}
