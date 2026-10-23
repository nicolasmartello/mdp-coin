"use client";

import { type ReactNode } from "react";
import { useWatchBalance } from "@scaffold-ui/hooks";
import { type Address } from "viem";
import { Card } from "~~/components/ui/card";
import { Separator } from "~~/components/ui/separator";
import { Skeleton } from "~~/components/ui/skeleton";
import { MdpLogo } from "~~/components/wallet/MdpLogo";
import { useMdpBalance } from "~~/hooks/mdp";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";
import { formatTokenAmount } from "~~/utils/ui";

type AssetRowProps = {
  icon: ReactNode;
  name: string;
  detail: string;
  balance: bigint | undefined;
  decimals: number;
};

const AssetRow = ({ icon, name, detail, balance, decimals }: AssetRowProps) => (
  <li aria-label={name} className="flex items-center gap-3 px-4 py-3">
    {icon}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
    {balance === undefined ? (
      <Skeleton aria-label={`Loading ${name} balance`} className="h-4 w-16" />
    ) : (
      <span className="text-sm font-semibold tabular-nums">{formatTokenAmount(balance, decimals)}</span>
    )}
  </li>
);

export const AssetsCard = ({ address }: { address: Address }) => {
  const { targetNetwork } = useTargetNetwork();
  const { nativeCurrency } = targetNetwork;
  const { balance: mdpBalance } = useMdpBalance(address);
  const { data: ethBalance } = useWatchBalance({ address, chain: targetNetwork });

  return (
    <section aria-label="Assets" className="flex flex-col gap-2">
      <h2 className="px-1 text-sm font-semibold">Assets</h2>
      <Card className="gap-0 py-1 shadow-card">
        <ul>
          <AssetRow
            icon={<MdpLogo className="size-9" decorative />}
            name={MDP_TOKEN.name}
            detail={MDP_TOKEN.symbol}
            balance={mdpBalance}
            decimals={MDP_TOKEN.decimals}
          />
          <Separator />
          <AssetRow
            icon={
              <span
                className="flex size-9 items-center justify-center rounded-full bg-[#627eea] font-semibold text-white"
                aria-hidden
              >
                Ξ
              </span>
            }
            name={nativeCurrency.name}
            detail={`${nativeCurrency.symbol} · gas`}
            balance={ethBalance?.value}
            decimals={nativeCurrency.decimals}
          />
        </ul>
      </Card>
    </section>
  );
};
