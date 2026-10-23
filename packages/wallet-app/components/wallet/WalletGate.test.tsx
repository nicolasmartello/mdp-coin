import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WalletGate } from "~~/components/wallet/WalletGate";
import { renderWithProviders } from "~~/test/render";
import { createTestChain } from "~~/test/rpc/testChain";
import { serveTestChain } from "~~/test/server";
import { TEST_ACCOUNT, connectBurner, switchToMainnet } from "~~/test/wallet";

const renderGate = () => renderWithProviders(<WalletGate>{address => <p>Connected as {address}</p>}</WalletGate>);

describe("WalletGate", () => {
  it("shows the connect prompt when disconnected", async () => {
    serveTestChain(createTestChain());
    renderGate();

    expect(await screen.findByRole("heading", { name: "MdpCoin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
  });

  it("renders children with the connected address", async () => {
    serveTestChain(createTestChain());
    renderGate();
    await connectBurner();

    expect(await screen.findByText(`Connected as ${TEST_ACCOUNT}`)).toBeInTheDocument();
  });

  it("shows the wrong-network screen on mainnet", async () => {
    serveTestChain(createTestChain());
    renderGate();
    await connectBurner();
    await switchToMainnet();

    expect(await screen.findByText("Wrong network")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to Hardhat" })).toBeInTheDocument();
  });

  it("switches back to Hardhat from the wrong-network screen", async () => {
    serveTestChain(createTestChain());
    const { user } = renderGate();
    await connectBurner();
    await switchToMainnet();

    await user.click(await screen.findByRole("button", { name: "Switch to Hardhat" }));

    expect(await screen.findByText(`Connected as ${TEST_ACCOUNT}`)).toBeInTheDocument();
  });
});
