"use client";

import { useSwitchChain } from "wagmi";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button, EmptyState } from "~~/components/ui";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export const WrongNetwork = () => {
  const { targetNetwork } = useTargetNetwork();
  const { switchChain, isPending } = useSwitchChain();

  return (
    <EmptyState
      className="flex-1 justify-center"
      icon={<ExclamationTriangleIcon className="text-warning" />}
      title="Red incorrecta"
      description={`MdpCoin vive en la red ${targetNetwork.name}. Cambiá de red en tu wallet para continuar.`}
      action={
        <Button loading={isPending} onClick={() => switchChain({ chainId: targetNetwork.id })}>
          Cambiar a {targetNetwork.name}
        </Button>
      }
    />
  );
};
