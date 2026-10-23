import { type ReactElement, type ReactNode } from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WagmiProvider } from "wagmi";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

/** The app's real provider tree (see app/layout.tsx and ScaffoldEthAppWithProviders) */
const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <ThemeProvider attribute={["class", "data-theme"]} defaultTheme="light" enableSystem={false}>
      <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export const renderWithProviders = (ui: ReactElement) => ({
  user: userEvent.setup(),
  ...render(ui, { wrapper: Providers }),
});
