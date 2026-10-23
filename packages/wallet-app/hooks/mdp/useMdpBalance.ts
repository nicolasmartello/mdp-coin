import { type Address } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";

/**
 * MDP balance of `address`, refreshed on every new block.
 */
export const useMdpBalance = (address: Address | undefined) => {
  const { data, isLoading } = useScaffoldReadContract({
    contractName: MDP_TOKEN.contractName,
    functionName: "balanceOf",
    args: [address],
  });

  return { balance: data, isLoading };
};
