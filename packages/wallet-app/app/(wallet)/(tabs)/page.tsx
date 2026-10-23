"use client";

import type { NextPage } from "next";
import { WalletGate, WalletHome } from "~~/components/wallet";

const Home: NextPage = () => <WalletGate>{address => <WalletHome address={address} />}</WalletGate>;

export default Home;
