"use client";

import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { SettingsList, WalletGate } from "~~/components/wallet";

const Settings: NextPage = () => {
  const router = useRouter();

  return (
    <WalletGate>
      {address => (
        <div className="flex flex-col gap-3 px-4 pt-2 pb-6">
          <h1 className="px-1 text-lg font-semibold">Settings</h1>
          <SettingsList address={address} onDisconnected={() => router.push("/")} />
        </div>
      )}
    </WalletGate>
  );
};

export default Settings;
