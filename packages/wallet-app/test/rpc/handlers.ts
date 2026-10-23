import { HttpResponse, http } from "msw";
import {
  type Address,
  type Hex,
  decodeFunctionData,
  encodeErrorResult,
  encodeFunctionResult,
  getAddress,
  isAddressEqual,
  keccak256,
  numberToHex,
  parseGwei,
  parseTransaction,
  recoverTransactionAddress,
} from "viem";
import { DEPLOYER, MDP_COIN, type TestChain, type TestLog } from "~~/test/rpc/testChain";

type RpcRequest = { jsonrpc: "2.0"; id: number | string; method: string; params?: unknown[] };

class RpcError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly data?: Hex,
  ) {
    super(message);
  }
}

const LOCAL_CHAIN_ID = 31337;
const MAINNET_CHAIN_ID = 1;
const GAS_PRICE = parseGwei("1");
const mdpAddress = getAddress(MDP_COIN.address);

const isLocalNode = (url: URL) => ["127.0.0.1:8545", "localhost:8545"].includes(url.host);

const formatBlock = (block: { number: bigint; hash: Hex; timestamp: bigint }) => ({
  number: numberToHex(block.number),
  hash: block.hash,
  parentHash: keccak256(block.hash),
  timestamp: numberToHex(block.timestamp),
  baseFeePerGas: numberToHex(GAS_PRICE),
  gasLimit: numberToHex(30_000_000),
  gasUsed: "0x0",
  difficulty: "0x0",
  totalDifficulty: "0x0",
  extraData: "0x",
  logsBloom: `0x${"0".repeat(512)}`,
  miner: DEPLOYER,
  mixHash: `0x${"0".repeat(64)}`,
  nonce: "0x0000000000000000",
  receiptsRoot: `0x${"0".repeat(64)}`,
  sha3Uncles: `0x${"0".repeat(64)}`,
  size: "0x0",
  stateRoot: `0x${"0".repeat(64)}`,
  transactionsRoot: `0x${"0".repeat(64)}`,
  transactions: [],
  uncles: [],
});

const formatLog = (log: TestLog) => ({
  ...log,
  blockNumber: numberToHex(log.blockNumber),
  transactionIndex: numberToHex(log.transactionIndex),
  logIndex: numberToHex(log.logIndex),
  removed: false,
});

const insufficientBalance = (sender: Address, balance: bigint, needed: bigint) =>
  new RpcError(
    3,
    "execution reverted",
    encodeErrorResult({ abi: MDP_COIN.abi, errorName: "ERC20InsufficientBalance", args: [sender, balance, needed] }),
  );

/** Decodes an MDP `transfer` call, or returns undefined for any other call */
const decodeMdpTransfer = (to: Address | null | undefined, data: Hex | undefined) => {
  if (!to || !data || !isAddressEqual(to, mdpAddress)) return undefined;
  const { functionName, args } = decodeFunctionData({ abi: MDP_COIN.abi, data });
  if (functionName !== "transfer") return undefined;
  const [recipient, amount] = args as [Address, bigint];
  return { to: recipient, amount };
};

const assertCanTransfer = (chain: TestChain, from: Address, transfer?: { amount: bigint }) => {
  if (!transfer) return;
  const balance = chain.mdpBalanceOf(from);
  if (transfer.amount > balance) throw insufficientBalance(from, balance, transfer.amount);
};

const blockByTag = (chain: TestChain, tag: unknown) =>
  typeof tag === "string" && tag.startsWith("0x") ? chain.blockByNumber(BigInt(tag)) : chain.latestBlock;

const localMethods: Record<string, (chain: TestChain, params: any[]) => unknown | Promise<unknown>> = {
  eth_chainId: () => numberToHex(LOCAL_CHAIN_ID),
  net_version: () => String(LOCAL_CHAIN_ID),
  eth_blockNumber: chain => numberToHex(chain.latestBlock.number),
  eth_getBalance: (chain, [address]) => numberToHex(chain.ethBalanceOf(address)),
  eth_getTransactionCount: (chain, [address]) => numberToHex(chain.nonceOf(address)),
  eth_gasPrice: () => numberToHex(GAS_PRICE),
  eth_maxPriorityFeePerGas: () => numberToHex(GAS_PRICE),
  eth_getCode: (_chain, [address]) => (isAddressEqual(address, mdpAddress) ? "0x6080" : "0x"),
  eth_getBlockByNumber: (chain, [tag]) => {
    const block = blockByTag(chain, tag);
    return block ? formatBlock(block) : null;
  },
  eth_getBlockByHash: (chain, [hash]) => {
    const block = chain.blockByHash(hash);
    return block ? formatBlock(block) : null;
  },
  eth_call: (chain, [{ to, data }]) => {
    if (!to || !isAddressEqual(to, mdpAddress)) return "0x";
    const { functionName, args } = decodeFunctionData({ abi: MDP_COIN.abi, data });
    const results: Record<string, unknown> = {
      balanceOf: () => chain.mdpBalanceOf((args as [Address])[0]),
      name: () => "MdpCoin",
      symbol: () => "MDP",
      decimals: () => 18,
      totalSupply: () => 10n ** 24n,
    };
    const result = results[functionName];
    if (!result) throw new RpcError(-32601, `eth_call ${functionName} not emulated`);
    return encodeFunctionResult({
      abi: MDP_COIN.abi,
      functionName: functionName as "balanceOf",
      result: (result as () => bigint)(),
    });
  },
  eth_estimateGas: (chain, [{ from, to, data }]) => {
    assertCanTransfer(chain, from, decodeMdpTransfer(to, data));
    return numberToHex(100_000);
  },
  eth_sendRawTransaction: async (chain, [serializedTransaction]) => {
    const transaction = parseTransaction(serializedTransaction);
    const from = await recoverTransactionAddress({ serializedTransaction });
    const mdpTransfer = decodeMdpTransfer(transaction.to, transaction.data);
    assertCanTransfer(chain, from, mdpTransfer);
    chain.rawTransactions.push(serializedTransaction);
    return chain.applyTransaction({
      from,
      to: transaction.to ?? null,
      value: transaction.value,
      mdpTransfer,
      hash: keccak256(serializedTransaction),
    });
  },
  // Only Hardhat's unlocked accounts can do this; the local faucet sends from the deployer
  eth_sendTransaction: (chain, [{ from, to, value, data }]) => {
    if (!isAddressEqual(from, DEPLOYER)) throw new RpcError(-32000, "unknown account");
    const mdpTransfer = decodeMdpTransfer(to, data);
    assertCanTransfer(chain, from, mdpTransfer);
    return chain.applyTransaction({ from, to, value: value ? BigInt(value) : 0n, mdpTransfer });
  },
  eth_getTransactionReceipt: (chain, [hash]) => {
    const receipt = chain.receipt(hash);
    if (!receipt) return null;
    return {
      ...receipt,
      blockNumber: numberToHex(receipt.blockNumber),
      transactionIndex: "0x0",
      cumulativeGasUsed: numberToHex(100_000),
      gasUsed: numberToHex(100_000),
      effectiveGasPrice: numberToHex(GAS_PRICE),
      contractAddress: null,
      logs: receipt.logs.map(formatLog),
      logsBloom: `0x${"0".repeat(512)}`,
      status: "0x1",
      type: "0x2",
    };
  },
  eth_getTransactionByHash: (chain, [hash]) => {
    const receipt = chain.receipt(hash);
    if (!receipt) return null;
    return {
      hash,
      blockHash: receipt.blockHash,
      blockNumber: numberToHex(receipt.blockNumber),
      from: receipt.from,
      to: receipt.to,
      transactionIndex: "0x0",
      value: "0x0",
      input: "0x",
      nonce: "0x0",
      gas: numberToHex(100_000),
      gasPrice: numberToHex(GAS_PRICE),
      maxFeePerGas: numberToHex(GAS_PRICE),
      maxPriorityFeePerGas: numberToHex(GAS_PRICE),
      type: "0x2",
      chainId: numberToHex(LOCAL_CHAIN_ID),
      v: "0x0",
      r: "0x0",
      s: "0x0",
      accessList: [],
    };
  },
  eth_getLogs: (chain, [{ address, fromBlock, toBlock, topics = [] }]) => {
    const from = fromBlock && fromBlock !== "earliest" ? BigInt(fromBlock) : 0n;
    const to = toBlock && toBlock !== "latest" ? BigInt(toBlock) : chain.latestBlock.number;
    const addresses = [address]
      .flat()
      .filter(Boolean)
      .map(a => (a as string).toLowerCase());
    return chain
      .logs()
      .filter(log => log.blockNumber >= from && log.blockNumber <= to)
      .filter(log => addresses.length === 0 || addresses.includes(log.address.toLowerCase()))
      .filter(log =>
        (topics as (Hex | Hex[] | null)[]).every((topic, i) => {
          if (topic === null || topic === undefined) return true;
          const wanted = [topic].flat().map(t => t.toLowerCase());
          return wanted.includes(log.topics[i]?.toLowerCase());
        }),
      )
      .map(formatLog);
  },
};

/** Mainnet is only reached for ENS lookups and the wrong-network flow: an empty, quiet chain */
const mainnetMethods: Record<string, (params: any[]) => unknown> = {
  eth_chainId: () => numberToHex(MAINNET_CHAIN_ID),
  net_version: () => String(MAINNET_CHAIN_ID),
  eth_blockNumber: () => "0x1",
  eth_getBalance: () => "0x0",
  eth_call: () => "0x",
  eth_getBlockByNumber: () =>
    formatBlock({ number: 1n, hash: keccak256("0x01"), timestamp: BigInt(Math.floor(Date.now() / 1000)) }),
};

const handle = async (request: RpcRequest, chain: TestChain, local: boolean) => {
  try {
    let result: unknown;
    if (local) {
      if (chain.consumeFailure(request.method)) throw new RpcError(-32603, `${request.method} failed (test)`);
      const method = localMethods[request.method];
      if (!method) throw new RpcError(-32601, `Method ${request.method} not emulated`);
      result = await method(chain, request.params ?? []);
    } else {
      const method = mainnetMethods[request.method];
      if (!method) throw new RpcError(-32601, `Mainnet method ${request.method} not emulated`);
      result = method(request.params ?? []);
    }
    return { jsonrpc: "2.0", id: request.id, result };
  } catch (error) {
    const { code = -32603, message, data } = error as RpcError;
    return { jsonrpc: "2.0", id: request.id, error: { code, message, data } };
  }
};

/**
 * MSW handlers that answer every JSON-RPC POST the app makes: the local Hardhat node from `chain`,
 * any other endpoint as an empty mainnet. Non-JSON-RPC requests fall through and fail the test.
 */
export const rpcHandlers = (chain: TestChain) => [
  http.post("*", async ({ request }) => {
    const body: unknown = await request
      .clone()
      .json()
      .catch(() => undefined);
    const isRpc = (value: unknown): value is RpcRequest =>
      typeof value === "object" && value !== null && "jsonrpc" in value && "method" in value;

    const local = isLocalNode(new URL(request.url));
    let response;
    if (Array.isArray(body) && body.every(isRpc)) {
      response = await Promise.all(body.map(item => handle(item, chain, local)));
    } else if (isRpc(body)) {
      response = await handle(body, chain, local);
    } else {
      return undefined;
    }
    return HttpResponse.json(response);
  }),
];
