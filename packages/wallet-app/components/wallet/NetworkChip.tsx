"use client";

import { useNetworkColor, useTargetNetwork } from "~~/hooks/scaffold-eth";

export const NetworkChip = () => {
  const { targetNetwork } = useTargetNetwork();
  const networkColor = useNetworkColor();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
      <span className="size-2 rounded-full" style={{ backgroundColor: networkColor }} aria-hidden />
      {targetNetwork.name}
    </span>
  );
};
