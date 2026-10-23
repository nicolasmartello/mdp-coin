import { describe, expect, it } from "vitest";
import { TEST_ACCOUNT } from "~~/test/wallet";
import { formatRelativeTime, formatTokenAmount, shortenAddress } from "~~/utils/ui/format";

// A fixed "now" keeps relative-time tests deterministic
const NOW_MS = Date.UTC(2026, 9, 23, 12, 0, 0);
const NOW_SECONDS = NOW_MS / 1000;

describe("formatTokenAmount", () => {
  it("groups thousands and truncates to 4 decimals", () => {
    expect(formatTokenAmount(1234567890000000000000n, 18)).toBe("1,234.5678");
  });

  it("formats an unknown amount as zero", () => {
    expect(formatTokenAmount(undefined, 18)).toBe("0");
  });

  it("drops trailing zeros", () => {
    expect(formatTokenAmount(10n ** 18n, 18, 2)).toBe("1");
  });
});

describe("shortenAddress", () => {
  it("keeps the first and last 4 hex characters", () => {
    expect(shortenAddress(TEST_ACCOUNT)).toBe("0x7099...79C8");
  });
});

describe("formatRelativeTime", () => {
  it("formats seconds in English", () => {
    expect(formatRelativeTime(NOW_SECONDS - 30, NOW_MS)).toBe("30 seconds ago");
  });

  it("formats hours in English", () => {
    expect(formatRelativeTime(NOW_SECONDS - 7200, NOW_MS)).toBe("2 hours ago");
  });

  it("formats older dates as day and month", () => {
    expect(formatRelativeTime(NOW_SECONDS - 3 * 86400, NOW_MS)).toBe("Oct 20");
  });
});
