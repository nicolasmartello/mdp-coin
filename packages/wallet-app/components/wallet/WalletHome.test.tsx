import { screen, waitFor, within } from "@testing-library/react";
import { parseEther, parseUnits } from "viem";
import { describe, expect, it } from "vitest";
import { AppHeader } from "~~/components/wallet/AppHeader";
import { BottomTabBar } from "~~/components/wallet/BottomTabBar";
import { WalletHome } from "~~/components/wallet/WalletHome";
import { renderWithProviders } from "~~/test/render";
import { DEPLOYER, createTestChain } from "~~/test/rpc/testChain";
import { serveTestChain } from "~~/test/server";
import { TEST_ACCOUNT, connectBurner } from "~~/test/wallet";

const seededChain = () =>
  serveTestChain(
    createTestChain({
      mdp: { [TEST_ACCOUNT]: parseUnits("75", 18) },
      eth: { [TEST_ACCOUNT]: parseEther("2") },
    }),
  );

describe("WalletHome", () => {
  it("shows the total balance in the balance card", async () => {
    seededChain();
    renderWithProviders(<WalletHome address={TEST_ACCOUNT} />);
    await connectBurner();

    const card = screen.getByRole("region", { name: "Total balance" });
    expect(await within(card).findByText("75")).toBeInTheDocument();
    expect(within(card).getByText("MDP")).toBeInTheDocument();
    expect(within(card).getByText("0x7099...79C8")).toBeInTheDocument();
  });

  it("lists MdpCoin and Ether in assets", async () => {
    seededChain();
    renderWithProviders(<WalletHome address={TEST_ACCOUNT} />);
    await connectBurner();

    const assets = screen.getByRole("region", { name: "Assets" });
    const mdpRow = within(assets).getByRole("listitem", { name: "MdpCoin" });
    const ethRow = within(assets).getByRole("listitem", { name: "Ether" });
    expect(await within(mdpRow).findByText("75")).toBeInTheDocument();
    expect(within(ethRow).getByText("ETH · gas")).toBeInTheDocument();
    expect(await within(ethRow).findByText("2")).toBeInTheDocument();
  });

  it("links the Send and Receive tiles to their screens", () => {
    seededChain();
    renderWithProviders(<WalletHome address={TEST_ACCOUNT} />);

    expect(screen.getByRole("link", { name: "Send" })).toHaveAttribute("href", "/send");
    expect(screen.getByRole("link", { name: "Receive" })).toHaveAttribute("href", "/receive");
  });

  it("funds the account from the Faucet tile on the local chain", async () => {
    const chain = seededChain();
    const { user } = renderWithProviders(<WalletHome address={TEST_ACCOUNT} />);
    await connectBurner();

    await user.click(screen.getByRole("button", { name: "Faucet" }));

    // Balances refresh on the next polled block (viem polls the local chain every 4s)
    const card = screen.getByRole("region", { name: "Total balance" });
    expect(await within(card).findByText("175", undefined, { timeout: 10_000 })).toBeInTheDocument();
    await waitFor(() => expect(chain.ethBalanceOf(TEST_ACCOUNT)).toBe(parseEther("3")));
    expect(chain.nonceOf(DEPLOYER)).toBe(2);
  });

  it("keeps the balance skeleton when the balance read fails", async () => {
    const chain = seededChain();
    chain.failNext("eth_call");
    renderWithProviders(<WalletHome address={TEST_ACCOUNT} />);
    await connectBurner();

    const card = screen.getByRole("region", { name: "Total balance" });
    expect(await within(card).findByLabelText("Loading balance")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("NaN");
  });
});

describe("AppHeader", () => {
  it("shows the brand and the target network", () => {
    renderWithProviders(<AppHeader />);

    expect(screen.getByText("MdpCoin")).toBeInTheDocument();
    expect(screen.getByText("Hardhat")).toBeInTheDocument();
  });
});

describe("BottomTabBar", () => {
  it("marks the active tab and links every tab", () => {
    renderWithProviders(<BottomTabBar active="activity" />);

    expect(screen.getByRole("link", { name: "Activity" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Wallet" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Settings" })).not.toHaveAttribute("aria-current");
  });
});
