"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { getBlockExplorerAddressLink } from "@scaffold-ui/hooks";
import { Bug, Check, ChevronRight, Copy, ExternalLink, LogOut, Moon, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { type Address } from "viem";
import { hardhat } from "viem/chains";
import { useDisconnect } from "wagmi";
import { Card } from "~~/components/ui/card";
import { Separator } from "~~/components/ui/separator";
import { Switch } from "~~/components/ui/switch";
import { useCopyToClipboard, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { cn } from "~~/lib/utils";
import { shortenAddress } from "~~/utils/ui";

const rowClasses = "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors";
const interactiveRow = cn(rowClasses, "hover:bg-accent/50");

const RowIcon = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={cn(
      "flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground [&_svg]:size-4",
      className,
    )}
    aria-hidden
  >
    {children}
  </span>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section aria-label={title} className="flex flex-col gap-2">
    <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
    <Card className="gap-0 overflow-hidden py-0 shadow-card">{children}</Card>
  </section>
);

type SettingsListProps = {
  address: Address;
  onDisconnected?: () => void;
};

export const SettingsList = ({ address, onDisconnected }: SettingsListProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { resolvedTheme, setTheme } = useTheme();
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();
  const { disconnect } = useDisconnect();

  const isDarkMode = resolvedTheme === "dark";
  const isLocalChain = targetNetwork.id === hardhat.id;
  const explorerLink = getBlockExplorerAddressLink(targetNetwork, address);
  const copyLabel = isCopiedToClipboard ? "Address copied" : "Copy address";

  return (
    <div className="flex flex-col gap-6">
      <Section title="Account">
        <button
          type="button"
          aria-label={copyLabel}
          className={interactiveRow}
          onClick={() => copyToClipboard(address)}
        >
          <RowIcon>{isCopiedToClipboard ? <Check /> : <Copy />}</RowIcon>
          <span className="flex-1">
            <span className="block font-medium">{copyLabel}</span>
            <span className="block font-mono text-xs text-muted-foreground">{shortenAddress(address, 6)}</span>
          </span>
        </button>
        {explorerLink && (
          <>
            <Separator />
            <a
              href={explorerLink}
              aria-label="View on block explorer"
              className={interactiveRow}
              {...(explorerLink.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              <RowIcon>
                <ExternalLink />
              </RowIcon>
              <span className="flex-1 font-medium">View on block explorer</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </a>
          </>
        )}
      </Section>

      <Section title="Appearance">
        <div className={rowClasses}>
          <RowIcon>
            <Moon />
          </RowIcon>
          <label htmlFor="dark-mode" className="flex-1 font-medium">
            Dark mode
          </label>
          <Switch
            id="dark-mode"
            checked={isDarkMode}
            onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </Section>

      {isLocalChain && (
        <Section title="Developer">
          <Link href="/debug" className={interactiveRow}>
            <RowIcon>
              <Bug />
            </RowIcon>
            <span className="flex-1 font-medium">Debug Contracts</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
          <Separator />
          <Link href="/blockexplorer" className={interactiveRow}>
            <RowIcon>
              <Search />
            </RowIcon>
            <span className="flex-1 font-medium">Block Explorer</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
        </Section>
      )}

      <Card className="gap-0 overflow-hidden py-0 shadow-card">
        <button
          type="button"
          className={cn(interactiveRow, "text-destructive")}
          onClick={() => disconnect(undefined, { onSuccess: onDisconnected })}
        >
          <RowIcon className="bg-destructive/10 text-destructive">
            <LogOut />
          </RowIcon>
          <span className="flex-1 font-medium">Disconnect</span>
        </button>
      </Card>
    </div>
  );
};
