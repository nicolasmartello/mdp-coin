"use client";

import type { NextPage } from "next";
import { ActivityList, WalletGate } from "~~/components/wallet";

const Activity: NextPage = () => (
  <WalletGate>
    {address => (
      <div className="flex flex-col gap-3 px-4 pt-2 pb-6">
        <h1 className="px-1 text-lg font-semibold">Activity</h1>
        <ActivityList address={address} />
      </div>
    )}
  </WalletGate>
);

export default Activity;
