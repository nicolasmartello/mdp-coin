import { setupServer } from "msw/node";
import { rpcHandlers } from "~~/test/rpc/handlers";
import type { TestChain } from "~~/test/rpc/testChain";

export const server = setupServer();

/** Serves JSON-RPC from `chain` for the current test (handlers are reset after each test) */
export const useTestChain = (chain: TestChain) => {
  server.use(...rpcHandlers(chain));
  return chain;
};
