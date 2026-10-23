import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "~~/test/server";
import { resetClipboard } from "~~/test/shims";
import { clearViemCache } from "~~/test/viemCache";
import { disconnectWallet } from "~~/test/wallet";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(async () => {
  cleanup();
  await disconnectWallet();
  server.resetHandlers();
  localStorage.clear();
  resetClipboard();
  clearViemCache();
});

afterAll(() => server.close());
