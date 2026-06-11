import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "@/lib/format-relative-time";

describe("formatRelativeTime", () => {
  it('returns "just now" for recent dates', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe("just now");
  });

  it("returns minutes for timestamps within the hour", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe("5m ago");
  });

  it("returns hours for timestamps within 24 hours", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe("3h ago");
  });

  it("returns days for timestamps within the week", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe("2d ago");
  });

  it("returns weeks for older timestamps", () => {
    const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeWeeksAgo.toISOString())).toBe("3w ago");
  });

  it("returns months for timestamps within the year", () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoMonthsAgo.toISOString())).toBe("2mo ago");
  });

  it("returns years for old timestamps", () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoYearsAgo.toISOString())).toBe("2y ago");
  });
});
