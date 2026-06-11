import { TMDB_IMAGE_BASE } from "./client";

export type PosterSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original";
export type BackdropSize = "w300" | "w780" | "w1280" | "original";
export type LogoSizes = "w45" | "w92" | "w154" | "w185" | "w300" | "w500";
export type ProfileSize = "w45" | "w185" | "h632" | "original";

export function getImageUrl(path: string | null, size: PosterSize = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: BackdropSize = "original"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getLogoUrl(path: string | null, size: LogoSizes = "w185"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getProfileUrl(path: string | null, size: ProfileSize = "w185"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
