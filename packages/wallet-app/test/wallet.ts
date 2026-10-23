import { type Address } from "viem";
import { connect, disconnect, getAccount, switchChain } from "wagmi/actions";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

// Hardhat account #1: a well-known test key, never used outside the local chain
export const TEST_ACCOUNT: Address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const TEST_ACCOUNT_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const BURNER_STORAGE_KEY = "burnerWallet.pk";

/**
 * Connects the real Scaffold-ETH burner wallet, holding TEST_ACCOUNT's key.
 * Call it after rendering: WagmiProvider (ssr: true) rehydrates from storage on mount and would
 * drop a connection made before it, just like a user who connects once the page has loaded.
 */
export const connectBurner = async () => {
  localStorage.setItem(BURNER_STORAGE_KEY, TEST_ACCOUNT_KEY);
  const connector = wagmiConfig.connectors.find(c => c.id === "burnerWallet");
  if (!connector) throw new Error("Burner wallet connector is not configured");
  await connect(wagmiConfig, { connector });
};

export const switchToMainnet = () => switchChain(wagmiConfig, { chainId: 1 });

export const disconnectWallet = async () => {
  if (getAccount(wagmiConfig).status !== "disconnected") await disconnect(wagmiConfig);
};
