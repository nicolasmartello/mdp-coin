"use client";

import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { ScreenHeader, SendForm, WalletGate } from "~~/components/wallet";
import { MDP_TOKEN } from "~~/utils/mdp/token";

const Send: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <ScreenHeader title={`Send ${MDP_TOKEN.symbol}`} />
      <WalletGate>
        {address => (
          <SendForm address={address} onSent={() => router.push("/activity")} onCancel={() => router.push("/")} />
        )}
      </WalletGate>
    </>
  );
};

export default Send;
