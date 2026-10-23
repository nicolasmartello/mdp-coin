import { formatUnits } from "viem";

/**
 * Formats a raw token amount (bigint in the smallest unit) for display.
 * Truncates instead of rounding, so a balance is never shown larger than it is.
 * formatTokenAmount(1234567890000000000000n, 18) -> "1,234.5678"
 */
export const formatTokenAmount = (value: bigint | undefined, decimals: number, maxFractionDigits = 4) => {
  if (value === undefined) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const wholeFormatted = BigInt(whole).toLocaleString("en-US");
  const fractionTrimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, "");
  return fractionTrimmed ? `${wholeFormatted}.${fractionTrimmed}` : wholeFormatted;
};

/**
 * 0x5FbDB2315678afecb367f032d93F642f64180aa3 -> 0x5FbD...0aa3
 */
export const shortenAddress = (address: string, chars = 4) =>
  `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;

/**
 * Relative time for activity rows: "30 seconds ago", "yesterday", "Oct 12"
 */
export const formatRelativeTime = (timestampSeconds: bigint | number) => {
  const date = new Date(Number(timestampSeconds) * 1000);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, "second");
  if (Math.abs(diffSeconds) < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (Math.abs(diffSeconds) < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (Math.abs(diffSeconds) < 172800) return rtf.format(Math.round(diffSeconds / 86400), "day");
  return date.toLocaleDateString("en", { day: "numeric", month: "short" });
};
