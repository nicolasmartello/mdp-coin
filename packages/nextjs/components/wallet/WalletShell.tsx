import { type ReactNode } from "react";

/**
 * Mobile-first app frame: full width on phones, a centered phone-sized column on larger screens
 * (like a wallet extension popup).
 */
export const WalletShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-dvh bg-base-100 sm:bg-base-200 sm:py-6">
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-base-100 sm:min-h-[calc(100dvh-3rem)] sm:overflow-hidden sm:rounded-card sm:border sm:border-base-300">
      {children}
    </div>
  </div>
);
