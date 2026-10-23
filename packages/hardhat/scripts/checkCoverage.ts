import fs from "fs";

const LCOV_PATH = "coverage/lcov.info";
const MIN_PERCENT = 80;

/**
 * Fails the process when total line coverage in an lcov report is below `minPercent`.
 * Hardhat's coverage only reports lines and statements, so lines are the gate.
 */
export function checkCoverage(lcovPath: string, minPercent: number): void {
  const report = fs.readFileSync(lcovPath, "utf8");
  const sum = (key: "LF" | "LH") =>
    [...report.matchAll(new RegExp(`^${key}:(\\d+)$`, "gm"))].reduce((total, match) => total + Number(match[1]), 0);

  const found = sum("LF");
  const percent = found === 0 ? 0 : (sum("LH") / found) * 100;
  console.log(`Contract line coverage: ${percent.toFixed(2)}% (minimum ${minPercent}%)`);

  if (percent < minPercent) process.exit(1);
}

checkCoverage(LCOV_PATH, MIN_PERCENT);
