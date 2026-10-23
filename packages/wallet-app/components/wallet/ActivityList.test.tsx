import { screen, within } from "@testing-library/react";
import { type Address, parseUnits, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { ActivityList } from "~~/components/wallet/ActivityList";
import { renderWithProviders } from "~~/test/render";
import { DEPLOYER, createTestChain } from "~~/test/rpc/testChain";
import { serveTestChain } from "~~/test/server";
import { TEST_ACCOUNT, connectBurner } from "~~/test/wallet";

const OTHER: Address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const mdp = (amount: string) => parseUnits(amount, 18);

const renderActivity = async () => {
  renderWithProviders(<ActivityList address={TEST_ACCOUNT} />);
  await connectBurner();
};

describe("ActivityList", () => {
  it("shows a loading state, not the empty state, before the history loads", () => {
    serveTestChain(createTestChain());
    renderWithProviders(<ActivityList address={TEST_ACCOUNT} />);

    expect(screen.getByLabelText("Loading activity")).toBeInTheDocument();
    expect(screen.queryByText("No activity yet")).not.toBeInTheDocument();
  });

  it("shows an error, not the empty state, when the history can't be loaded", async () => {
    const chain = serveTestChain(createTestChain());
    chain.failAlways("eth_getLogs");
    await renderActivity();

    // viem retries a failing request 3 times with backoff before the error surfaces
    expect(await screen.findByText("Couldn't load activity", undefined, { timeout: 5_000 })).toBeInTheDocument();
    expect(screen.queryByText("No activity yet")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("shows the empty state", async () => {
    serveTestChain(createTestChain());
    await renderActivity();

    expect(await screen.findByText("No activity yet")).toBeInTheDocument();
    expect(screen.getByText("When you send or receive MDP, it will show up here.")).toBeInTheDocument();
  });

  it("shows an incoming transfer", async () => {
    const chain = serveTestChain(createTestChain());
    chain.transferMdp(DEPLOYER, TEST_ACCOUNT, mdp("100"));
    await renderActivity();

    const [row] = await screen.findAllByRole("listitem");
    expect(row).toHaveTextContent("Received");
    expect(row).toHaveTextContent("From 0xf39F...2266");
    expect(within(row).getByText("+100")).toBeInTheDocument();
    expect(within(row).getByText("MDP")).toBeInTheDocument();
  });

  it("shows an outgoing transfer", async () => {
    const chain = serveTestChain(createTestChain({ mdp: { [TEST_ACCOUNT]: mdp("75") } }));
    chain.transferMdp(TEST_ACCOUNT, OTHER, mdp("25"));
    await renderActivity();

    const [row] = await screen.findAllByRole("listitem");
    expect(row).toHaveTextContent("Sent");
    expect(row).toHaveTextContent("To 0x3C44...93BC");
    expect(within(row).getByText("-25")).toBeInTheDocument();
  });

  it("lists the newest transfer first", async () => {
    const chain = serveTestChain(createTestChain());
    chain.transferMdp(DEPLOYER, TEST_ACCOUNT, mdp("1"));
    chain.transferMdp(DEPLOYER, TEST_ACCOUNT, mdp("2"));
    await renderActivity();

    await screen.findByText("+1");
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("+2")).toBeInTheDocument();
  });

  it("shows a mint from the zero address as received", async () => {
    const chain = serveTestChain(createTestChain());
    chain.transferMdp(zeroAddress, TEST_ACCOUNT, mdp("1"));
    await renderActivity();

    const [row] = await screen.findAllByRole("listitem");
    expect(row).toHaveTextContent("Received");
    expect(row).toHaveTextContent("From 0x0000...0000");
  });

  it("shows a transfer to self once, as sent", async () => {
    const chain = serveTestChain(createTestChain({ mdp: { [TEST_ACCOUNT]: mdp("5") } }));
    chain.transferMdp(TEST_ACCOUNT, TEST_ACCOUNT, mdp("1"));
    await renderActivity();

    await screen.findByText("Sent");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
