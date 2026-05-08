export const DEFAULT_WALLPAPER_URL = "https://wallpapercave.com/wp/wp6589960.jpg";
export const WALLPAPER_STORAGE_KEY = "wallpaperUrl";

export function applyWallpaper(url: string | null) {
  const resolved = url || DEFAULT_WALLPAPER_URL;
  document.documentElement.style.setProperty("--wallpaper-url", `url(${resolved})`);
}
