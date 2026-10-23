import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WalletShell } from "~~/components/wallet/WalletShell";

describe("WalletShell", () => {
  it("renders the screen inside the phone-width column", () => {
    render(
      <WalletShell>
        <p>Screen content</p>
      </WalletShell>,
    );

    expect(screen.getByText("Screen content").parentElement).toHaveClass("max-w-md");
  });
});
