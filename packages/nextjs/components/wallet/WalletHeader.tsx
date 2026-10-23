"use client";

import { useState } from "react";
import { type Address } from "viem";
import { Bars3Icon, CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { IconButton } from "~~/components/ui";
import { AccountMenu } from "~~/components/wallet/AccountMenu";
import { useCopyToClipboard, useNetworkColor, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { shortenAddress } from "~~/utils/ui";

/**
 * Home screen header: network on the left, account in the center, menu on the right.
 */
export const WalletHeader = ({ address }: { address: Address }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { targetNetwork } = useTargetNetwork();
  const networkColor = useNetworkColor();
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  return (
    <header className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-base-100 px-2 py-2">
      <span className="inline-flex max-w-full items-center gap-1.5 justify-self-start rounded-pill bg-base-200 px-3 py-1.5 text-xs font-medium">
        <span className="size-2 shrink-0 rounded-pill" style={{ backgroundColor: networkColor }} />
        <span className="truncate">{targetNetwork.name}</span>
      </span>

      <button
        type="button"
        onClick={() => copyToClipboard(address)}
        className="inline-flex items-center gap-2 rounded-pill px-3 py-1.5 transition hover:bg-base-200"
        aria-label="Copiar dirección"
      >
        <span className="overflow-hidden rounded-pill">
          <BlockieAvatar address={address} size={24} />
        </span>
        <span className="font-mono text-sm font-medium">{shortenAddress(address)}</span>
        {isCopiedToClipboard ? (
          <CheckIcon className="size-4 text-success" />
        ) : (
          <DocumentDuplicateIcon className="size-4 text-base-content/60" />
        )}
      </button>

      <IconButton className="justify-self-end" label="Menú" icon={<Bars3Icon />} onClick={() => setIsMenuOpen(true)} />
      <AccountMenu address={address} open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
};
