"use client";

import { useWatchBalance } from "@scaffold-ui/hooks";
import { type Address } from "viem";
import { Avatar, ListItem, Skeleton } from "~~/components/legacy-ui";
import { MdpLogo } from "~~/components/wallet/MdpLogo";
import { useMdpBalance } from "~~/hooks/mdp";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";
import { formatTokenAmount } from "~~/utils/ui";

export const TokenList = ({ address }: { address: Address }) => {
  const { targetNetwork } = useTargetNetwork();
  const { balance: mdpBalance, isLoading: isMdpLoading } = useMdpBalance(address);
  const { data: ethBalance, isLoading: isEthLoading } = useWatchBalance({ address, chain: targetNetwork });
  const { nativeCurrency } = targetNetwork;

  return (
    <ul className="m-0 list-none p-0">
      <li>
        <ListItem
          leading={<MdpLogo />}
          title={MDP_TOKEN.name}
          subtitle={MDP_TOKEN.symbol}
          trailingTitle={
            isMdpLoading ? <Skeleton className="h-5 w-20" /> : formatTokenAmount(mdpBalance, MDP_TOKEN.decimals)
          }
          trailingSubtitle={MDP_TOKEN.symbol}
        />
      </li>
      <li>
        <ListItem
          leading={<Avatar label={nativeCurrency.symbol} />}
          title={nativeCurrency.name}
          subtitle={`${nativeCurrency.symbol} · para pagar gas`}
          trailingTitle={
            isEthLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              formatTokenAmount(ethBalance?.value, nativeCurrency.decimals)
            )
          }
          trailingSubtitle={nativeCurrency.symbol}
        />
      </li>
    </ul>
  );
};
