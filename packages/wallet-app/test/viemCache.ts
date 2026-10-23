import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

/*
  viem caches eth_blockNumber per client for `cacheTime` (4s on the local chain) in a module-level Map.
  The app's wagmiConfig, and so its clients, live for a whole test file, so without a reset a test would
  see the previous test's chain height and miss its logs. Clearing that cache between tests is the same
  hygiene as localStorage.clear(): no app code is replaced. viem doesn't export it, hence the file import.
*/
const require = createRequire(import.meta.url);
const viemRoot = require.resolve("viem/package.json").replace(/package\.json$/, "");
const { promiseCache, responseCache } = (await import(
  pathToFileURL(`${viemRoot}_esm/utils/promise/withCache.js`).href
)) as { promiseCache: Map<string, unknown>; responseCache: Map<string, unknown> };

export const clearViemCache = () => {
  promiseCache.clear();
  responseCache.clear();
};
