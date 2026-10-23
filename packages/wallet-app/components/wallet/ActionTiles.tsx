import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Fuel, Loader2 } from "lucide-react";
import { cn } from "~~/lib/utils";

const tileClasses = "flex flex-col items-center gap-1.5 text-xs font-medium";
const iconClasses =
  "flex size-12 items-center justify-center rounded-2xl border border-tile-border bg-tile text-tile-foreground shadow-card transition-colors [&_svg]:size-5";

const TileIcon = ({ children }: { children: ReactNode }) => (
  <span className={iconClasses} aria-hidden>
    {children}
  </span>
);

type ActionTilesProps = {
  // Local chain only: funds the account with test ETH and MDP
  onFaucet?: () => void;
  isFaucetLoading?: boolean;
};

export const ActionTiles = ({ onFaucet, isFaucetLoading }: ActionTilesProps) => (
  <nav aria-label="Actions" className="flex justify-around px-6">
    <Link href="/send" className={tileClasses}>
      <TileIcon>
        <ArrowUp />
      </TileIcon>
      Send
    </Link>
    <Link href="/receive" className={tileClasses}>
      <TileIcon>
        <ArrowDown />
      </TileIcon>
      Receive
    </Link>
    {onFaucet && (
      <button
        type="button"
        onClick={onFaucet}
        disabled={isFaucetLoading}
        className={cn(tileClasses, "disabled:opacity-60")}
      >
        <TileIcon>{isFaucetLoading ? <Loader2 className="animate-spin" /> : <Fuel />}</TileIcon>
        Faucet
      </button>
    )}
  </nav>
);
