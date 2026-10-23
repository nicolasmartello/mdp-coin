import { screen, waitFor } from "@testing-library/react";
import { type Address, parseEther, parseUnits } from "viem";
import { describe, expect, it, vi } from "vitest";
import { ScreenHeader } from "~~/components/wallet/ScreenHeader";
import { SendForm } from "~~/components/wallet/SendForm";
import { renderWithProviders } from "~~/test/render";
import { createTestChain } from "~~/test/rpc/testChain";
import { serveTestChain } from "~~/test/server";
import { TEST_ACCOUNT, connectBurner } from "~~/test/wallet";

const RECIPIENT: Address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const mdp = (amount: string) => parseUnits(amount, 18);

const renderSend = async () => {
  const chain = serveTestChain(
    createTestChain({ mdp: { [TEST_ACCOUNT]: mdp("75") }, eth: { [TEST_ACCOUNT]: parseEther("1") } }),
  );
  const onSent = vi.fn();
  const onCancel = vi.fn();
  const view = renderWithProviders(<SendForm address={TEST_ACCOUNT} onSent={onSent} onCancel={onCancel} />);
  await connectBurner();
  // The balance has loaded once "Available" shows it
  await screen.findByText("Available: 75 MDP");
  return { ...view, chain, onSent, onCancel };
};

const recipientInput = () => screen.getByPlaceholderText("0x… address or ENS name");
const amountInput = () => screen.getByLabelText("Amount");
const sendButton = () => screen.getByRole("button", { name: "Send" });

describe("SendForm validation", () => {
  it("asks for an address", async () => {
    const { user } = await renderSend();
    await user.type(amountInput(), "1");

    expect(screen.getByRole("alert")).toHaveTextContent("Enter an address");
    expect(sendButton()).toBeDisabled();
  });

  it("rejects an invalid address", async () => {
    const { user } = await renderSend();
    await user.type(recipientInput(), "0x123");
    await user.type(amountInput(), "1");

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid address");
    expect(sendButton()).toBeDisabled();
  });

  it("rejects sending to yourself", async () => {
    const { user } = await renderSend();
    await user.type(recipientInput(), TEST_ACCOUNT);
    await user.type(amountInput(), "1");

    expect(screen.getByRole("alert")).toHaveTextContent("You can't send to yourself");
    expect(sendButton()).toBeDisabled();
  });

  it.each([".", "0", "0.000"])("asks for an amount when it is %j", async value => {
    const { user } = await renderSend();
    await user.type(recipientInput(), RECIPIENT);
    await user.type(amountInput(), value);

    expect(screen.getByRole("alert")).toHaveTextContent("Enter an amount");
    expect(sendButton()).toBeDisabled();
  });

  it("rejects more than the balance", async () => {
    const { user } = await renderSend();
    await user.type(recipientInput(), RECIPIENT);
    await user.type(amountInput(), "76");

    expect(screen.getByRole("alert")).toHaveTextContent("Insufficient balance");
    expect(sendButton()).toBeDisabled();
  });
});

describe("SendForm amount input", () => {
  it("rejects more than 18 decimals at input", async () => {
    const { user } = await renderSend();
    await user.type(amountInput(), "1.0000000000000000001");

    expect(amountInput()).toHaveValue("1.000000000000000000");
  });

  it("keeps thousands separators of a pasted amount as grouping", async () => {
    const { user } = await renderSend();
    await user.click(amountInput());
    await user.paste("1,000");

    expect(amountInput()).toHaveValue("1000");
  });

  it("accepts a comma as decimal separator", async () => {
    const { user } = await renderSend();
    await user.type(amountInput(), "1,5");

    expect(amountInput()).toHaveValue("1.5");
  });

  it("fills the full balance with Max", async () => {
    const { user } = await renderSend();
    await user.type(recipientInput(), RECIPIENT);
    await user.click(screen.getByRole("button", { name: "Max" }));

    expect(amountInput()).toHaveValue("75");
    expect(sendButton()).toBeEnabled();
  });
});

describe("SendForm without a known balance", () => {
  it("shows a loading placeholder instead of 0 and keeps Send disabled", async () => {
    const chain = serveTestChain(
      createTestChain({ mdp: { [TEST_ACCOUNT]: mdp("75") }, eth: { [TEST_ACCOUNT]: parseEther("1") } }),
    );
    chain.failAlways("eth_call");
    const { user } = renderWithProviders(<SendForm address={TEST_ACCOUNT} onSent={vi.fn()} onCancel={vi.fn()} />);
    await connectBurner();

    expect(await screen.findByRole("status", { name: "Loading balance" })).toBeInTheDocument();
    expect(screen.queryByText(/Available: 0 MDP/)).not.toBeInTheDocument();
    await user.type(recipientInput(), RECIPIENT);
    await user.type(amountInput(), "1");
    expect(sendButton()).toBeDisabled();
  });

  it("does not report success when MdpCoin is not deployed", async () => {
    const chain = serveTestChain(createTestChain({ mdpDeployed: false, eth: { [TEST_ACCOUNT]: parseEther("1") } }));
    const onSent = vi.fn();
    const { user } = renderWithProviders(<SendForm address={TEST_ACCOUNT} onSent={onSent} onCancel={vi.fn()} />);
    await connectBurner();
    await user.type(recipientInput(), RECIPIENT);
    await user.type(amountInput(), "1");
    await user.click(sendButton());

    await new Promise(resolve => setTimeout(resolve, 500));
    expect(onSent).not.toHaveBeenCalled();
    expect(chain.rawTransactions).toHaveLength(0);
  });
});

describe("SendForm submit", () => {
  it("reports a failed send and stays on the form when there is no ETH for gas", async () => {
    const chain = serveTestChain(createTestChain({ mdp: { [TEST_ACCOUNT]: mdp("75") } }));
    const onSent = vi.fn();
    const { user } = renderWithProviders(<SendForm address={TEST_ACCOUNT} onSent={onSent} onCancel={vi.fn()} />);
    await connectBurner();
    await screen.findByText("Available: 75 MDP");
    await user.type(recipientInput(), RECIPIENT);
    await user.type(amountInput(), "25");
    await user.click(sendButton());

    expect(await screen.findByText(/insufficient funds/i)).toBeInTheDocument();
    expect(onSent).not.toHaveBeenCalled();
    expect(chain.rawTransactions).toHaveLength(0);
    expect(sendButton()).toBeEnabled();
  });

  it("sends MDP", async () => {
    const { user, chain, onSent } = await renderSend();
    await user.type(recipientInput(), RECIPIENT);
    await user.type(amountInput(), "25");
    await user.click(sendButton());

    await waitFor(() => expect(onSent).toHaveBeenCalledOnce());
    expect(chain.rawTransactions).toHaveLength(1);
    expect(chain.mdpBalanceOf(TEST_ACCOUNT)).toBe(mdp("50"));
    expect(chain.mdpBalanceOf(RECIPIENT)).toBe(mdp("25"));
  });

  it("sends a single transaction on double click", async () => {
    const { user, chain, onSent } = await renderSend();
    await user.type(recipientInput(), RECIPIENT);
    await user.type(amountInput(), "25");
    await user.dblClick(sendButton());

    await waitFor(() => expect(onSent).toHaveBeenCalledOnce());
    expect(chain.rawTransactions).toHaveLength(1);
  });

  it("calls onCancel", async () => {
    const { user, onCancel } = await renderSend();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe("ScreenHeader", () => {
  it("links back with an accessible name", () => {
    renderWithProviders(<ScreenHeader title="Send MDP" />);

    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("heading", { name: "Send MDP" })).toBeInTheDocument();
  });
});
