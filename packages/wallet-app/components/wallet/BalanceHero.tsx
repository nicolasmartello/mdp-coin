"use client";

import { type Address } from "viem";
import { Skeleton } from "~~/components/ui";
import { useMdpBalance } from "~~/hooks/mdp";
import { MDP_TOKEN } from "~~/utils/mdp/token";
import { formatTokenAmount } from "~~/utils/ui";

export const BalanceHero = ({ address }: { address: Address }) => {
  const { balance, isLoading } = useMdpBalance(address);

  return (
    <section className="flex flex-col items-center gap-1 px-4 pt-6 pb-2" aria-label="Saldo">
      {isLoading ? (
        <Skeleton className="h-10 w-48" />
      ) : (
        <p className="m-0 text-4xl font-bold tracking-tight tabular-nums">
          {formatTokenAmount(balance, MDP_TOKEN.decimals, 2)}
          <span className="ml-2 text-2xl font-semibold text-base-content/60">{MDP_TOKEN.symbol}</span>
        </p>
      )}
      <p className="m-0 text-sm text-base-content/60">Saldo disponible</p>
    </section>
  );
};
