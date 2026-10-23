import { type ReactElement, type ReactNode, useState } from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

/**
 * The same providers the app uses (app/layout.tsx + ScaffoldEthAppWithProviders), with test-friendly settings:
 * - no query retries, so an RPC error shows up at once instead of after React Query's 3 retries;
 * - no reconnect on mount: tests connect explicitly with connectBurner();
 * - a fixed light theme instead of the OS theme;
 * - no route progress bar, which needs the Next.js router.
 */
const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <ThemeProvider attribute={["class", "data-theme"]} defaultTheme="light" enableSystem={false}>
      <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
          <Toaster />
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export const renderWithProviders = (ui: ReactElement) => ({
  user: userEvent.setup(),
  ...render(ui, { wrapper: Providers }),
});
