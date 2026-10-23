"use client";

import type { NextPage } from "next";
import { ReceiveCard, ScreenHeader, WalletGate } from "~~/components/wallet";
import { MDP_TOKEN } from "~~/utils/mdp/token";

const Receive: NextPage = () => (
  <>
    <ScreenHeader title={`Recibir ${MDP_TOKEN.symbol}`} />
    <WalletGate>{address => <ReceiveCard address={address} />}</WalletGate>
  </>
);

export default Receive;
