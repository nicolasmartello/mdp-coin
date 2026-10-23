"use client";

import { type Address } from "viem";
import { Skeleton } from "~~/components/ui/skeleton";
import { MdpLogo } from "~~/components/wallet/MdpLogo";
import { useMdpBalance } from "~~/hooks/mdp";
import { MDP_TOKEN } from "~~/utils/mdp/token";
import { formatTokenAmount, shortenAddress } from "~~/utils/ui";

/**
 * The one place the Atomic-style gradient is used. Looks the same in light and dark themes.
 */
export const BalanceCard = ({ address }: { address: Address }) => {
  const { balance } = useMdpBalance(address);

  return (
    <section
      aria-label="Total balance"
      className="relative overflow-hidden rounded-[22px] bg-balance-gradient p-5 text-white shadow-card"
    >
      <MdpLogo className="absolute -right-5 -bottom-5 size-32 opacity-25" decorative />
      <p className="text-xs text-white/85">Total balance</p>
      {balance === undefined ? (
        <Skeleton aria-label="Loading balance" className="mt-2 h-9 w-40 bg-white/30" />
      ) : (
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-3xl font-light tracking-tight tabular-nums">
            {formatTokenAmount(balance, MDP_TOKEN.decimals, 2)}
          </span>
          <span className="text-sm text-white/85">{MDP_TOKEN.symbol}</span>
        </p>
      )}
      <p className="mt-4 font-mono text-xs text-white/80">{shortenAddress(address)}</p>
    </section>
  );
};
