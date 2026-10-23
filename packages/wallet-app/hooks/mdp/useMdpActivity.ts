import { useMemo } from "react";
import { type Address, isAddressEqual } from "viem";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";

export type MdpActivityItem = {
  id: string;
  direction: "in" | "out";
  counterparty: Address;
  amount: bigint;
  timestamp?: bigint;
  transactionHash: `0x${string}`;
};

/**
 * MDP transfers sent or received by `address`, newest first.
 *
 * Reads every Transfer event and filters on the client. Fine for a local chain
 * or a small token; a production app would query an indexer (Ponder, The Graph).
 */
export const useMdpActivity = (address: Address | undefined) => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- local-chain only, see the note above
  const history = useScaffoldEventHistory({
    contractName: MDP_TOKEN.contractName,
    eventName: "Transfer",
    watch: true,
    blockData: true,
    enabled: Boolean(address),
  });

  const { data: events, status, refetch } = history;

  const items = useMemo<MdpActivityItem[]>(() => {
    if (!address || !events) return [];

    return events.flatMap(event => {
      const { from, to, value } = event.args;
      if (!from || !to || value === undefined) return [];

      const isOutgoing = isAddressEqual(from, address);
      const isIncoming = isAddressEqual(to, address);
      if (!isOutgoing && !isIncoming) return [];

      return [
        {
          id: `${event.transactionHash}-${event.logIndex}`,
          direction: isOutgoing ? "out" : "in",
          counterparty: isOutgoing ? to : from,
          amount: value,
          // SE-2's event type puts `blockData` on the array instead of on each event, hence the cast
          timestamp: (event as { blockData?: { timestamp: bigint } | null }).blockData?.timestamp,
          transactionHash: event.transactionHash,
        },
      ];
    });
  }, [address, events]);

  // "pending" also covers the moment before the query is enabled, so the UI never flashes "No activity yet"
  return { items, isLoading: status === "pending", isError: status === "error", retry: refetch };
};
