"use client";

import { getBlockExplorerAddressLink } from "@scaffold-ui/hooks";
import { useTheme } from "next-themes";
import { type Address } from "viem";
import { hardhat } from "viem/chains";
import { useDisconnect } from "wagmi";
import {
  ArrowRightStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  BugAntIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { Avatar, ListItem, Sheet } from "~~/components/ui";
import { useCopyToClipboard, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { shortenAddress } from "~~/utils/ui";

type AccountMenuProps = {
  address: Address;
  open: boolean;
  onClose: () => void;
};

export const AccountMenu = ({ address, open, onClose }: AccountMenuProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { disconnect } = useDisconnect();
  const { resolvedTheme, setTheme } = useTheme();
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  const isDarkMode = resolvedTheme === "dark";
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const explorerLink = getBlockExplorerAddressLink(targetNetwork, address);

  return (
    <Sheet open={open} onClose={onClose} title="Cuenta">
      <div className="flex flex-col items-center gap-2 px-4 pb-4">
        <span className="overflow-hidden rounded-pill">
          <BlockieAvatar address={address} size={64} />
        </span>
        <span className="font-mono text-sm text-base-content/60">{shortenAddress(address, 6)}</span>
      </div>

      <ListItem
        leading={<Avatar>{isCopiedToClipboard ? <CheckIcon /> : <DocumentDuplicateIcon />}</Avatar>}
        title={isCopiedToClipboard ? "Dirección copiada" : "Copiar dirección"}
        onClick={() => copyToClipboard(address)}
      />
      {explorerLink && (
        <ListItem
          leading={
            <Avatar>
              <ArrowTopRightOnSquareIcon />
            </Avatar>
          }
          title="Ver en el explorador"
          href={explorerLink}
        />
      )}
      <ListItem
        leading={<Avatar>{isDarkMode ? <SunIcon /> : <MoonIcon />}</Avatar>}
        title={isDarkMode ? "Tema claro" : "Tema oscuro"}
        onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      />

      {isLocalNetwork && (
        <>
          <p className="m-0 px-4 pt-4 pb-1 text-xs font-semibold tracking-wide text-base-content/60 uppercase">
            Desarrollo
          </p>
          <ListItem
            leading={
              <Avatar>
                <BugAntIcon />
              </Avatar>
            }
            title="Debug Contracts"
            href="/debug"
          />
          <ListItem
            leading={
              <Avatar>
                <MagnifyingGlassIcon />
              </Avatar>
            }
            title="Block Explorer"
            href="/blockexplorer"
          />
        </>
      )}

      <div className="mt-2 border-t border-base-300 pt-2">
        <ListItem
          className="text-error"
          leading={
            <Avatar className="bg-error/10 text-error">
              <ArrowRightStartOnRectangleIcon />
            </Avatar>
          }
          title="Desconectar"
          onClick={() => {
            disconnect();
            onClose();
          }}
        />
      </div>
    </Sheet>
  );
};
