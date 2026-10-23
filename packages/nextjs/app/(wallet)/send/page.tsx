"use client";

import type { NextPage } from "next";
import { ScreenHeader, SendForm, WalletGate } from "~~/components/wallet";
import { MDP_TOKEN } from "~~/utils/mdp/token";

const Send: NextPage = () => (
  <>
    <ScreenHeader title={`Enviar ${MDP_TOKEN.symbol}`} />
    <WalletGate>{address => <SendForm address={address} />}</WalletGate>
  </>
);

export default Send;
