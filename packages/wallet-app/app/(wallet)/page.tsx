"use client";

import { Suspense } from "react";
import { HomeScreen } from "./_components/HomeScreen";
import type { NextPage } from "next";
import { WalletGate } from "~~/components/wallet";

const Home: NextPage = () => (
  // useSearchParams (tab state) requires a Suspense boundary
  <Suspense>
    <WalletGate>{address => <HomeScreen address={address} />}</WalletGate>
  </Suspense>
);

export default Home;
