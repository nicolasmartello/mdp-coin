"use client";

import { type Address } from "viem";
import { hardhat } from "viem/chains";
import { ActionTiles } from "~~/components/wallet/ActionTiles";
import { AssetsCard } from "~~/components/wallet/AssetsCard";
import { BalanceCard } from "~~/components/wallet/BalanceCard";
import { useLocalFaucet } from "~~/hooks/mdp";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export const WalletHome = ({ address }: { address: Address }) => {
  const { targetNetwork } = useTargetNetwork();
  const { requestFunds, isLoading } = useLocalFaucet(address);
  const isLocalChain = targetNetwork.id === hardhat.id;

  return (
    <div className="flex flex-col gap-6 px-4 pt-2 pb-6">
      <BalanceCard address={address} />
      <ActionTiles onFaucet={isLocalChain ? requestFunds : undefined} isFaucetLoading={isLoading} />
      <AssetsCard address={address} />
    </div>
  );
};
