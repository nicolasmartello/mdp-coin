import { screen } from "@testing-library/react";
import { parseUnits } from "viem";
import { describe, expect, it } from "vitest";
import { useAccount } from "wagmi";
import { useMdpBalance } from "~~/hooks/mdp";
import { renderWithProviders } from "~~/test/render";
import { createTestChain } from "~~/test/rpc/testChain";
import { serveTestChain } from "~~/test/server";
import { TEST_ACCOUNT, connectBurner } from "~~/test/wallet";

const BalanceProbe = () => {
  const { address } = useAccount();
  const { balance } = useMdpBalance(address);
  return (
    <p>
      {address} {balance?.toString()}
    </p>
  );
};

describe("test harness", () => {
  it("connects the burner wallet and reads the MDP balance through MSW", async () => {
    serveTestChain(createTestChain({ mdp: { [TEST_ACCOUNT]: parseUnits("75", 18) } }));
    renderWithProviders(<BalanceProbe />);
    await connectBurner();

    expect(await screen.findByText(new RegExp(`${TEST_ACCOUNT} 75000000000000000000`))).toBeInTheDocument();
  });

  it("fails unhandled HTTP requests", async () => {
    await expect(fetch("https://example.com/")).rejects.toThrow();
  });
});
