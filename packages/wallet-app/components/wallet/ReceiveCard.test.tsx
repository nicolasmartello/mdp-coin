import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReceiveCard } from "~~/components/wallet/ReceiveCard";
import { renderWithProviders } from "~~/test/render";
import { TEST_ACCOUNT } from "~~/test/wallet";

describe("ReceiveCard", () => {
  it("shows a QR code and the full address", () => {
    renderWithProviders(<ReceiveCard address={TEST_ACCOUNT} />);

    expect(screen.getByTestId("receive-qr").querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText(TEST_ACCOUNT)).toBeInTheDocument();
  });

  it("warns about the network", () => {
    renderWithProviders(<ReceiveCard address={TEST_ACCOUNT} />);

    expect(
      screen.getByText("Only send MDP on the Hardhat network. Tokens sent from another network can be lost."),
    ).toBeInTheDocument();
  });

  it("copies the address", async () => {
    const { user } = renderWithProviders(<ReceiveCard address={TEST_ACCOUNT} />);

    await user.click(screen.getByRole("button", { name: "Copy address" }));

    expect(await navigator.clipboard.readText()).toBe(TEST_ACCOUNT);
    expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();
  });
});
