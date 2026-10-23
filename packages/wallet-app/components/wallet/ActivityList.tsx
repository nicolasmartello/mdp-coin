"use client";

import { type Address } from "viem";
import { ArrowDownLeftIcon, ArrowUpRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Avatar, EmptyState, ListItem, Skeleton } from "~~/components/legacy-ui";
import { useMdpActivity } from "~~/hooks/mdp";
import { MDP_TOKEN } from "~~/utils/mdp/token";
import { cn, formatRelativeTime, formatTokenAmount, shortenAddress } from "~~/utils/ui";

export const ActivityList = ({ address }: { address: Address }) => {
  const { items, isLoading } = useMdpActivity(address);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-pill" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ClockIcon />}
        title="Todavía no hay movimientos"
        description="Cuando envíes o recibas MDP, vas a verlo acá."
      />
    );
  }

  return (
    <ul className="m-0 list-none p-0">
      {items.map(item => {
        const isIncoming = item.direction === "in";
        return (
          <li key={item.id}>
            <ListItem
              leading={
                <Avatar className={cn(isIncoming && "bg-success/10 text-success")}>
                  {isIncoming ? <ArrowDownLeftIcon /> : <ArrowUpRightIcon />}
                </Avatar>
              }
              title={isIncoming ? "Recibido" : "Enviado"}
              subtitle={
                <>
                  {isIncoming ? "De " : "A "}
                  <span className="font-mono">{shortenAddress(item.counterparty)}</span>
                  {item.timestamp !== undefined && ` · ${formatRelativeTime(item.timestamp)}`}
                </>
              }
              trailingTitle={
                <span className={cn(isIncoming && "text-success")}>
                  {isIncoming ? "+" : "-"}
                  {formatTokenAmount(item.amount, MDP_TOKEN.decimals)}
                </span>
              }
              trailingSubtitle={MDP_TOKEN.symbol}
            />
          </li>
        );
      })}
    </ul>
  );
};
