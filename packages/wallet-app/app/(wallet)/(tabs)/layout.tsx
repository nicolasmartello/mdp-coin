"use client";

import { usePathname } from "next/navigation";
import { AppHeader, BottomTabBar, type TabId } from "~~/components/wallet";

const tabFromPath = (pathname: string): TabId => {
  if (pathname.startsWith("/activity")) return "activity";
  if (pathname.startsWith("/settings")) return "settings";
  return "wallet";
};

const TabsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <BottomTabBar active={tabFromPath(pathname)} />
    </>
  );
};

export default TabsLayout;
