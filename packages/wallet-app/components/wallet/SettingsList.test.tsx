import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getAccount } from "wagmi/actions";
import { SettingsList } from "~~/components/wallet/SettingsList";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { renderWithProviders } from "~~/test/render";
import { createTestChain } from "~~/test/rpc/testChain";
import { serveTestChain } from "~~/test/server";
import { TEST_ACCOUNT, connectBurner } from "~~/test/wallet";

const renderSettings = (onDisconnected?: () => void) => {
  serveTestChain(createTestChain());
  return renderWithProviders(<SettingsList address={TEST_ACCOUNT} onDisconnected={onDisconnected} />);
};

describe("SettingsList", () => {
  it("copies the address", async () => {
    const { user } = renderSettings();

    await user.click(screen.getByRole("button", { name: "Copy address" }));

    expect(await navigator.clipboard.readText()).toBe(TEST_ACCOUNT);
    expect(screen.getByRole("button", { name: "Address copied" })).toBeInTheDocument();
  });

  it("links to the block explorer", () => {
    renderSettings();

    expect(screen.getByRole("link", { name: "View on block explorer" })).toHaveAttribute(
      "href",
      `/blockexplorer/address/${TEST_ACCOUNT}`,
    );
  });

  it("toggles dark mode", async () => {
    const { user } = renderSettings();
    const toggle = screen.getByRole("switch", { name: "Dark mode" });

    await user.click(toggle);
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(toggle).toBeChecked();

    await user.click(toggle);
    await waitFor(() => expect(document.documentElement).not.toHaveClass("dark"));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("shows developer links on the local chain", () => {
    renderSettings();

    expect(screen.getByRole("link", { name: "Debug Contracts" })).toHaveAttribute("href", "/debug");
    expect(screen.getByRole("link", { name: "Block Explorer" })).toHaveAttribute("href", "/blockexplorer");
  });

  it("disconnects the wallet", async () => {
    const onDisconnected = vi.fn();
    const { user } = renderSettings(onDisconnected);
    await connectBurner();

    await user.click(screen.getByRole("button", { name: "Disconnect" }));

    await waitFor(() => expect(onDisconnected).toHaveBeenCalledOnce());
    expect(getAccount(wagmiConfig).status).toBe("disconnected");
  });
});
