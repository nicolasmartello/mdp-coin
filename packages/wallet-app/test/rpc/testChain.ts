import {
  type Address,
  type Hex,
  encodeAbiParameters,
  encodeEventTopics,
  getAddress,
  keccak256,
  numberToHex,
  parseEther,
  toHex,
  zeroAddress,
} from "viem";
import deployedContracts from "~~/contracts/deployedContracts";

export const MDP_COIN = deployedContracts[31337].MdpCoin;

// Hardhat account #0: deploys MdpCoin and is unlocked on the local node (used by the local faucet)
export const DEPLOYER: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export type TestLog = {
  address: Address;
  topics: Hex[];
  data: Hex;
  blockNumber: bigint;
  blockHash: Hex;
  transactionHash: Hex;
  transactionIndex: number;
  logIndex: number;
};

export type TestReceipt = {
  transactionHash: Hex;
  blockNumber: bigint;
  blockHash: Hex;
  from: Address;
  to: Address | null;
  logs: TestLog[];
};

type Block = { number: bigint; hash: Hex; timestamp: bigint };

type Seed = { mdp?: Record<Address, bigint>; eth?: Record<Address, bigint> };

const key = (address: Address) => address.toLowerCase();

/**
 * In-memory stand-in for the local Hardhat node: ETH and MDP balances, nonces, blocks,
 * Transfer logs and receipts. MSW handlers (./handlers.ts) serve JSON-RPC from this state.
 */
export const createTestChain = (seed: Seed = {}) => {
  const eth = new Map<string, bigint>();
  const mdp = new Map<string, bigint>();
  const nonces = new Map<string, number>();
  const blocks: Block[] = [];
  const logs: TestLog[] = [];
  const receipts = new Map<Hex, TestReceipt>();
  const failures = new Set<string>();
  const rawTransactions: Hex[] = [];
  let txCounter = 0;

  const mineBlock = (): Block => {
    const number = BigInt(blocks.length + 1);
    const block = {
      number,
      hash: keccak256(toHex(`block-${number}`)),
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
    };
    blocks.push(block);
    return block;
  };
  mineBlock();

  const chain = {
    rawTransactions,

    get latestBlock() {
      return blocks[blocks.length - 1];
    },
    blockByNumber: (number: bigint) => blocks.find(block => block.number === number),
    blockByHash: (hash: Hex) => blocks.find(block => block.hash === hash),

    ethBalanceOf: (address: Address) => eth.get(key(address)) ?? 0n,
    mdpBalanceOf: (address: Address) => mdp.get(key(address)) ?? 0n,
    nonceOf: (address: Address) => nonces.get(key(address)) ?? 0,

    /** The next JSON-RPC call to `method` answers with an error */
    failNext: (method: string) => failures.add(method),
    consumeFailure: (method: string) => failures.delete(method),

    logs: () => logs,
    receipt: (hash: Hex) => receipts.get(hash),

    /**
     * Applies a transaction: moves ETH `value` and, for an MDP transfer, MDP `amount`.
     * Mines one block and records the receipt (with a Transfer log for MDP).
     */
    applyTransaction({
      from,
      to,
      value = 0n,
      mdpTransfer,
      hash,
    }: {
      from: Address;
      to: Address | null;
      value?: bigint;
      mdpTransfer?: { to: Address; amount: bigint };
      hash?: Hex;
    }): Hex {
      const transactionHash = hash ?? keccak256(toHex(`tx-${++txCounter}`));
      if (value > 0n && to) {
        eth.set(key(from), chain.ethBalanceOf(from) - value);
        eth.set(key(to), chain.ethBalanceOf(to) + value);
      }
      nonces.set(key(from), chain.nonceOf(from) + 1);

      const block = mineBlock();
      const txLogs: TestLog[] = [];
      if (mdpTransfer) {
        if (from !== zeroAddress) mdp.set(key(from), chain.mdpBalanceOf(from) - mdpTransfer.amount);
        mdp.set(key(mdpTransfer.to), chain.mdpBalanceOf(mdpTransfer.to) + mdpTransfer.amount);
        txLogs.push({
          address: getAddress(MDP_COIN.address),
          topics: encodeEventTopics({
            abi: MDP_COIN.abi,
            eventName: "Transfer",
            args: { from, to: mdpTransfer.to },
          }) as Hex[],
          data: encodeAbiParameters([{ type: "uint256" }], [mdpTransfer.amount]),
          blockNumber: block.number,
          blockHash: block.hash,
          transactionHash,
          transactionIndex: 0,
          logIndex: logs.length,
        });
        logs.push(...txLogs);
      }
      receipts.set(transactionHash, {
        transactionHash,
        blockNumber: block.number,
        blockHash: block.hash,
        from,
        to,
        logs: txLogs,
      });
      return transactionHash;
    },

    /** Seeds an MDP Transfer (from the zero address = mint) as if it happened on chain */
    transferMdp: (from: Address, to: Address, amount: bigint) =>
      chain.applyTransaction({ from, to: getAddress(MDP_COIN.address), mdpTransfer: { to, amount } }),
  };

  // The deployer holds plenty of ETH and the MDP that is not seeded elsewhere, like on a fresh `yarn chain`
  eth.set(key(DEPLOYER), parseEther("10000"));
  mdp.set(key(DEPLOYER), parseEther("1000000"));
  for (const [address, amount] of Object.entries(seed.eth ?? {})) eth.set(key(address as Address), amount);
  for (const [address, amount] of Object.entries(seed.mdp ?? {})) {
    mdp.set(key(address as Address), amount);
    mdp.set(key(DEPLOYER), chain.mdpBalanceOf(DEPLOYER) - amount);
  }

  return chain;
};

export type TestChain = ReturnType<typeof createTestChain>;

export const toRpcQuantity = (value: bigint | number) => numberToHex(value);
