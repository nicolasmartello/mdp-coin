"use client";

import { type SubmitEvent, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { type Address, formatUnits, isAddress, isAddressEqual, parseUnits } from "viem";
import { Button } from "~~/components/ui/button";
import { Label } from "~~/components/ui/label";
import { Skeleton } from "~~/components/ui/skeleton";
import { AmountInput } from "~~/components/wallet/AmountInput";
import { RecipientInput } from "~~/components/wallet/RecipientInput";
import { useMdpBalance } from "~~/hooks/mdp";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";
import { formatTokenAmount } from "~~/utils/ui";

const parseAmount = (amount: string) => (amount === "" || amount === "." ? 0n : parseUnits(amount, MDP_TOKEN.decimals));

/**
 * Returns the first problem with the form, or undefined when it can be submitted.
 */
const validate = (from: Address, to: string, amount: bigint, balance: bigint | undefined) => {
  if (!to) return "Enter an address";
  if (!isAddress(to)) return "Invalid address";
  if (isAddressEqual(to, from)) return "You can't send to yourself";
  if (amount === 0n) return "Enter an amount";
  if (balance !== undefined && amount > balance) return "Insufficient balance";
  return undefined;
};

type SendFormProps = {
  address: Address;
  onSent: () => void;
  onCancel: () => void;
};

export const SendForm = ({ address, onSent, onCancel }: SendFormProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // A ref, unlike state, is already set when a second click arrives in the same tick
  const submittingRef = useRef(false);
  const { balance } = useMdpBalance(address);
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: MDP_TOKEN.contractName });

  const parsedAmount = parseAmount(amount);
  const error = validate(address, recipient, parsedAmount, balance);
  // Don't flag errors before the user typed anything
  const visibleError = recipient || amount ? error : undefined;

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const hash = await writeContractAsync({ functionName: "transfer", args: [recipient as Address, parsedAmount] });
      // Scaffold-ETH returns undefined (after its own notification) when it couldn't send at all
      if (hash) onSent();
    } catch (e) {
      // useScaffoldWriteContract already shows an error notification
      console.error("MDP transfer failed", e);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-6">
      <div className="flex flex-col gap-2">
        <Label>To</Label>
        <RecipientInput value={recipient} onChange={setRecipient} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="amount">Amount</Label>
          {balance === undefined ? (
            <Skeleton role="status" aria-label="Loading balance" className="h-3.5 w-28" />
          ) : (
            <span className="text-xs text-muted-foreground">
              Available: {formatTokenAmount(balance, MDP_TOKEN.decimals)} {MDP_TOKEN.symbol}
            </span>
          )}
        </div>
        <AmountInput
          id="amount"
          value={amount}
          onChange={setAmount}
          symbol={MDP_TOKEN.symbol}
          decimals={MDP_TOKEN.decimals}
          invalid={visibleError === "Insufficient balance"}
          onMax={balance !== undefined ? () => setAmount(formatUnits(balance, MDP_TOKEN.decimals)) : undefined}
        />
      </div>

      <p className="min-h-5 text-sm text-destructive" role="alert">
        {visibleError}
      </p>

      <div className="mt-auto flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1 rounded-full" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-1 rounded-full"
          disabled={Boolean(error) || balance === undefined || isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
          Send
        </Button>
      </div>
    </form>
  );
};
