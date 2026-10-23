import { useState } from "react";
import { type Address, createWalletClient, http, parseEther, parseUnits } from "viem";
import { hardhat } from "viem/chains";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";

const FAUCET_ETH = "1";
const FAUCET_MDP = "100";
// Hardhat's first default account: it deploys MdpCoin, so it holds the whole supply
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const localWalletClient = createWalletClient({ chain: hardhat, transport: http() });

/**
 * Local-chain only: sends ETH (for gas) and MDP to `address` from the unlocked deployer account.
 */
export const useLocalFaucet = (address: Address | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const transactor = useTransactor(localWalletClient);
  const { data: mdpCoin } = useDeployedContractInfo({ contractName: MDP_TOKEN.contractName });

  const requestFunds = async () => {
    if (!address || !mdpCoin) return;
    setIsLoading(true);
    try {
      await transactor({ account: FAUCET_ADDRESS, to: address, value: parseEther(FAUCET_ETH) });
      await transactor(() =>
        localWalletClient.writeContract({
          account: FAUCET_ADDRESS,
          address: mdpCoin.address,
          abi: mdpCoin.abi,
          functionName: "transfer",
          args: [address, parseUnits(FAUCET_MDP, MDP_TOKEN.decimals)],
        }),
      );
    } catch (error) {
      console.error("Local faucet failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { requestFunds, isLoading };
};
