"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type Address } from "viem";
import { hardhat } from "viem/chains";
import { ArrowDownIcon, ArrowUpIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { type TabItem, Tabs } from "~~/components/legacy-ui";
import { ActionBar, ActionButton, ActivityList, BalanceHero, TokenList, WalletHeader } from "~~/components/wallet";
import { useLocalFaucet } from "~~/hooks/mdp";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

type HomeTab = "tokens" | "activity";

const TABS: readonly TabItem<HomeTab>[] = [
  { id: "tokens", label: "Tokens" },
  { id: "activity", label: "Actividad" },
];

export const HomeScreen = ({ address }: { address: Address }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { targetNetwork } = useTargetNetwork();
  const { requestFunds, isLoading: isFaucetLoading } = useLocalFaucet(address);

  // The selected tab lives in the URL (?tab=activity) so it survives reloads and can be linked to
  const tab: HomeTab = searchParams.get("tab") === "activity" ? "activity" : "tokens";
  const setTab = (next: HomeTab) =>
    router.replace(next === "tokens" ? pathname : `${pathname}?tab=${next}`, { scroll: false });

  return (
    <>
      <WalletHeader address={address} />
      <BalanceHero address={address} />
      <ActionBar>
        <ActionButton href="/send" icon={<ArrowUpIcon />} label="Enviar" />
        <ActionButton href="/receive" icon={<ArrowDownIcon />} label="Recibir" />
        {targetNetwork.id === hardhat.id && (
          <ActionButton onClick={requestFunds} loading={isFaucetLoading} icon={<BanknotesIcon />} label="Faucet" />
        )}
      </ActionBar>
      <Tabs items={TABS} value={tab} onChange={setTab} className="mt-2" />
      <div className="flex-1 pb-6">
        {tab === "tokens" ? <TokenList address={address} /> : <ActivityList address={address} />}
      </div>
    </>
  );
};
