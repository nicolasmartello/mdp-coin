"use client";

import { QRCodeSVG } from "qrcode.react";
import { type Address } from "viem";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Button, Card } from "~~/components/ui";
import { useCopyToClipboard, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";

export const ReceiveCard = ({ address }: { address: Address }) => {
  const { targetNetwork } = useTargetNetwork();
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4 pt-4 pb-6">
      <Card className="flex w-full flex-col items-center gap-4 p-6">
        {/* White background on purpose: QR scanners need contrast, even in dark mode */}
        <div className="rounded-field bg-white p-3">
          <QRCodeSVG value={address} size={200} />
        </div>
        <p className="m-0 text-center font-mono text-sm break-all">{address}</p>
      </Card>

      <p className="m-0 text-center text-sm text-base-content/60">
        Usá esta dirección para recibir {MDP_TOKEN.symbol} en la red <strong>{targetNetwork.name}</strong>. Si te envían
        tokens desde otra red, se pueden perder.
      </p>

      <Button
        size="lg"
        fullWidth
        className="mt-auto"
        icon={isCopiedToClipboard ? <CheckIcon className="size-5" /> : <DocumentDuplicateIcon className="size-5" />}
        onClick={() => copyToClipboard(address)}
      >
        {isCopiedToClipboard ? "¡Copiada!" : "Copiar dirección"}
      </Button>
    </div>
  );
};
