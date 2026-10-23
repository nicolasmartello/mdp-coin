import { screen, waitFor } from "@testing-library/react";
import { type Address, parseUnits } from "viem";
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
  const chain = serveTestChain(createTestChain({ mdp: { [TEST_ACCOUNT]: mdp("75") } }));
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

describe("SendForm submit", () => {
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
