import { describe, it, expect } from "vitest";
import { getImageUrl, getBackdropUrl, getLogoUrl, getProfileUrl, TmdbApiError } from "@/lib/tmdb";

describe("TMDB Image Utilities", () => {
  describe("getImageUrl", () => {
    it("returns full TMDB image URL for a given path with default size w500", () => {
      const path = "/abc123.jpg";
      const result = getImageUrl(path);
      expect(result).toBe("https://image.tmdb.org/t/p/w500/abc123.jpg");
    });

    it("returns null for falsy path", () => {
      expect(getImageUrl("")).toBeNull();
      expect(getImageUrl(null as unknown as string)).toBeNull();
      expect(getImageUrl(undefined as unknown as string)).toBeNull();
    });

    it("accepts custom size parameter", () => {
      const result = getImageUrl("/test.jpg", "w780");
      expect(result).toBe("https://image.tmdb.org/t/p/w780/test.jpg");
    });

    it("accepts w185 size parameter", () => {
      const result = getImageUrl("/test.jpg", "w185");
      expect(result).toBe("https://image.tmdb.org/t/p/w185/test.jpg");
    });
  });

  describe("getBackdropUrl", () => {
    it("returns backdrop URL with default original size", () => {
      const result = getBackdropUrl("/backdrop.jpg");
      expect(result).toBe("https://image.tmdb.org/t/p/original/backdrop.jpg");
    });
  });

  describe("getLogoUrl", () => {
    it("returns logo URL with default w185 size", () => {
      const result = getLogoUrl("/logo.png");
      expect(result).toBe("https://image.tmdb.org/t/p/w185/logo.png");
    });
  });

  describe("getProfileUrl", () => {
    it("returns profile URL with default w185 size", () => {
      const result = getProfileUrl("/profile.jpg");
      expect(result).toBe("https://image.tmdb.org/t/p/w185/profile.jpg");
    });
  });
});

describe("TmdbApiError", () => {
  it("creates error with code and statusCode", () => {
    const error = new TmdbApiError("Not Found", "RESOURCE_NOT_FOUND", 404);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Not Found");
    expect(error.code).toBe("RESOURCE_NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("TmdbApiError");
  });

  it("defaults statusCode to undefined", () => {
    const error = new TmdbApiError("Server error", "UNKNOWN");
    expect(error.code).toBe("UNKNOWN");
    expect(error.statusCode).toBeUndefined();
  });
});
