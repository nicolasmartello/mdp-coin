"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "~~/components/ui/button";
import { MdpLogo } from "~~/components/wallet/MdpLogo";

export const ConnectPrompt = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <MdpLogo className="size-20" decorative />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">MdpCoin</h1>
        <p className="text-sm text-muted-foreground">
          Connect your wallet to see your balance and send or receive MDP.
        </p>
      </div>
      <Button size="lg" className="w-full rounded-full" onClick={openConnectModal}>
        Connect wallet
      </Button>
    </div>
  );
};
