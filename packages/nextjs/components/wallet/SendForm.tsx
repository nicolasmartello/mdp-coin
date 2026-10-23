"use client";

import { type SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { type Address, formatUnits, isAddress, isAddressEqual, parseUnits } from "viem";
import { Button } from "~~/components/ui";
import { AmountInput } from "~~/components/wallet/AmountInput";
import { RecipientInput } from "~~/components/wallet/RecipientInput";
import { useMdpBalance } from "~~/hooks/mdp";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { MDP_TOKEN } from "~~/utils/mdp/token";
import { formatTokenAmount } from "~~/utils/ui";

const parseAmount = (amount: string) => {
  if (!amount || amount === ".") return 0n;
  return parseUnits(amount, MDP_TOKEN.decimals);
};

/**
 * Returns the first problem with the form, or undefined when it can be submitted.
 */
const validate = (from: Address, to: string, amount: bigint, balance: bigint | undefined) => {
  if (!to) return "Ingresá una dirección";
  if (!isAddress(to)) return "Dirección inválida";
  if (isAddressEqual(to, from)) return "No podés enviarte a vos mismo";
  if (amount === 0n) return "Ingresá un monto";
  if (balance !== undefined && amount > balance) return "Saldo insuficiente";
  return undefined;
};

export const SendForm = ({ address }: { address: Address }) => {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { balance } = useMdpBalance(address);
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: MDP_TOKEN.contractName });

  const parsedAmount = parseAmount(amount);
  const error = validate(address, recipient, parsedAmount, balance);
  // Don't shout at the user before they typed anything
  const visibleError = recipient || amount ? error : undefined;

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error) return;
    try {
      await writeContractAsync({
        functionName: "transfer",
        args: [recipient as Address, parsedAmount],
      });
      router.push("/?tab=activity");
    } catch (e) {
      // useScaffoldWriteContract already shows an error notification
      console.error("MDP transfer failed", e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Para</label>
        <RecipientInput value={recipient} onChange={setRecipient} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="amount" className="text-sm font-semibold">
            Monto
          </label>
          <span className="text-xs text-base-content/60">
            Disponible: {formatTokenAmount(balance, MDP_TOKEN.decimals)} {MDP_TOKEN.symbol}
          </span>
        </div>
        <AmountInput
          id="amount"
          value={amount}
          onChange={setAmount}
          symbol={MDP_TOKEN.symbol}
          decimals={MDP_TOKEN.decimals}
          error={visibleError === "Saldo insuficiente"}
          onMax={balance !== undefined ? () => setAmount(formatUnits(balance, MDP_TOKEN.decimals)) : undefined}
        />
      </div>

      <p className="m-0 min-h-5 text-sm text-error" role="alert">
        {visibleError}
      </p>

      <div className="mt-auto flex gap-3">
        <Button variant="secondary" size="lg" fullWidth onClick={() => router.push("/")}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" fullWidth disabled={Boolean(error)} loading={isMining}>
          Enviar
        </Button>
      </div>
    </form>
  );
};
