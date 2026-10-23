"use client";

import { TriangleAlert } from "lucide-react";
import { useSwitchChain } from "wagmi";
import { Button } from "~~/components/ui/button";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export const WrongNetwork = () => {
  const { targetNetwork } = useTargetNetwork();
  const { switchChain, isPending } = useSwitchChain();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <TriangleAlert className="size-10 text-amber-500" aria-hidden />
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Wrong network</h2>
        <p className="text-sm text-muted-foreground">
          MdpCoin lives on {targetNetwork.name}. Switch networks in your wallet to continue.
        </p>
      </div>
      <Button className="rounded-full" disabled={isPending} onClick={() => switchChain({ chainId: targetNetwork.id })}>
        Switch to {targetNetwork.name}
      </Button>
    </div>
  );
};
