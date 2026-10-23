"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "~~/components/legacy-ui";
import { MdpLogo } from "~~/components/wallet/MdpLogo";

export const ConnectPrompt = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <MdpLogo className="size-20" />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-2xl font-bold">MdpCoin</h1>
        <p className="m-0 text-base-content/60">Conectá tu wallet para ver tu saldo, enviar y recibir MDP.</p>
      </div>
      <Button size="lg" fullWidth onClick={openConnectModal}>
        Conectar wallet
      </Button>
    </div>
  );
};
