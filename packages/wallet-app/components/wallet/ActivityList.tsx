"use client";

import { ArrowDownLeft, ArrowUpRight, CloudOff, History } from "lucide-react";
import { type Address } from "viem";
import { Button } from "~~/components/ui/button";
import { Card } from "~~/components/ui/card";
import { Skeleton } from "~~/components/ui/skeleton";
import { type MdpActivityItem, useMdpActivity } from "~~/hooks/mdp";
import { cn } from "~~/lib/utils";
import { MDP_TOKEN } from "~~/utils/mdp/token";
import { formatRelativeTime, formatTokenAmount, shortenAddress } from "~~/utils/ui";

const ActivityRow = ({ item }: { item: MdpActivityItem }) => {
  const isIncoming = item.direction === "in";
  const Icon = isIncoming ? ArrowDownLeft : ArrowUpRight;

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          isIncoming ? "bg-success/10 text-success" : "bg-secondary text-secondary-foreground",
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{isIncoming ? "Received" : "Sent"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {isIncoming ? "From " : "To "}
          <span className="font-mono">{shortenAddress(item.counterparty)}</span>
          {item.timestamp !== undefined && ` · ${formatRelativeTime(item.timestamp)}`}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className={cn("text-sm font-semibold tabular-nums", isIncoming && "text-success")}>
          {isIncoming ? "+" : "-"}
          {formatTokenAmount(item.amount, MDP_TOKEN.decimals)}
        </span>
        <span className="text-xs text-muted-foreground">{MDP_TOKEN.symbol}</span>
      </div>
    </li>
  );
};

export const ActivityList = ({ address }: { address: Address }) => {
  const { items, isLoading, isError, retry } = useMdpActivity(address);

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <CloudOff className="mb-2 size-10 text-muted-foreground/60" aria-hidden />
        <p className="font-semibold">Couldn&apos;t load activity</p>
        <p className="text-sm text-muted-foreground">Check that your local chain is running.</p>
        <Button variant="outline" className="mt-3 rounded-full" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="gap-4 px-4 py-4 shadow-card" aria-busy="true" aria-label="Loading activity">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <History className="mb-2 size-10 text-muted-foreground/60" aria-hidden />
        <p className="font-semibold">No activity yet</p>
        <p className="text-sm text-muted-foreground">When you send or receive MDP, it will show up here.</p>
      </div>
    );
  }

  return (
    <Card className="gap-0 py-1 shadow-card">
      <ul className="divide-y">
        {items.map(item => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </ul>
    </Card>
  );
};
