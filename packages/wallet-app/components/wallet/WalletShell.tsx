import { type ReactNode } from "react";

/**
 * Mobile-first app frame: full width on phones, a centered phone-sized column on larger screens.
 */
export const WalletShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-dvh bg-background sm:py-6">
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background sm:min-h-[calc(100dvh-3rem)] sm:overflow-hidden sm:rounded-3xl sm:border sm:shadow-card">
      {children}
    </div>
  </div>
);
