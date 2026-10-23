import Link from "next/link";
import { History, Settings, Wallet } from "lucide-react";
import { cn } from "~~/lib/utils";

export type TabId = "wallet" | "activity" | "settings";

const TABS = [
  { id: "wallet", label: "Wallet", href: "/", Icon: Wallet },
  { id: "activity", label: "Activity", href: "/activity", Icon: History },
  { id: "settings", label: "Settings", href: "/settings", Icon: Settings },
] as const;

export const BottomTabBar = ({ active }: { active: TabId }) => (
  <nav aria-label="Main" className="sticky bottom-0 z-10 flex border-t bg-card pb-[env(safe-area-inset-bottom)]">
    {TABS.map(({ id, label, href, Icon }) => (
      <Link
        key={id}
        href={href}
        aria-current={id === active ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
          id === active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden />
        {label}
      </Link>
    ))}
  </nav>
);
