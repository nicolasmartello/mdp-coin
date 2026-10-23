"use client";

import { type ReactNode } from "react";
import { useIsClient } from "usehooks-ts";
import { type Address } from "viem";
import { useAccount } from "wagmi";
import { Skeleton } from "~~/components/ui";
import { ConnectPrompt } from "~~/components/wallet/ConnectPrompt";
import { WrongNetwork } from "~~/components/wallet/WrongNetwork";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

type WalletGateProps = {
  // Render prop: only called once there is a connected account on the right network
  children: (address: Address) => ReactNode;
};

/**
 * Guards wallet screens: shows the connect prompt or the wrong-network screen when needed,
 * so the screens themselves can assume a connected account.
 */
export const WalletGate = ({ children }: WalletGateProps) => {
  const isClient = useIsClient();
  const { address, chainId, status } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  // wagmi restores the previous session after hydration; avoid flashing the connect screen meanwhile
  if (!isClient || status === "reconnecting" || status === "connecting") {
    return (
      <div className="flex flex-col items-center gap-4 px-6 pt-24">
        <Skeleton className="size-16 rounded-pill" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!address) return <ConnectPrompt />;
  if (chainId !== targetNetwork.id) return <WrongNetwork />;

  return <>{children(address)}</>;
};
