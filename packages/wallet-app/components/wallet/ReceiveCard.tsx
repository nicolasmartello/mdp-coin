"use client";

import { Check, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { type Address } from "viem";
import { Button } from "~~/components/ui/button";
import { Card } from "~~/components/ui/card";
import { useCopyToClipboard, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";

export const ReceiveCard = ({ address }: { address: Address }) => {
  const { targetNetwork } = useTargetNetwork();
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4 pt-2 pb-6">
      <Card className="w-full items-center gap-4 p-6 shadow-card">
        {/* White background on purpose: QR scanners need contrast, also in dark mode */}
        <div data-testid="receive-qr" className="rounded-xl bg-white p-3">
          <QRCodeSVG value={address} size={200} />
        </div>
        <p className="text-center font-mono text-sm break-all">{address}</p>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Only send {MDP_TOKEN.symbol} on the {targetNetwork.name} network. Tokens sent from another network can be lost.
      </p>

      <Button size="lg" className="mt-auto w-full rounded-full" onClick={() => copyToClipboard(address)}>
        {isCopiedToClipboard ? <Check aria-hidden /> : <Copy aria-hidden />}
        {isCopiedToClipboard ? "Copied!" : "Copy address"}
      </Button>
    </div>
  );
};
