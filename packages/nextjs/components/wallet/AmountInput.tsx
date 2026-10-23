"use client";

import { cn } from "~~/utils/ui";

type AmountInputProps = {
  value: string;
  onChange: (value: string) => void;
  symbol: string;
  decimals: number;
  onMax?: () => void;
  error?: boolean;
  id?: string;
};

/**
 * Numeric amount field with token symbol and an optional "Máx." shortcut.
 * Only accepts digits and one dot, with at most `decimals` fractional digits,
 * so the value can always be parsed by viem's parseUnits.
 */
export const AmountInput = ({ value, onChange, symbol, decimals, onMax, error, id }: AmountInputProps) => {
  const pattern = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-field border bg-base-100 px-4 transition",
        "focus-within:border-primary",
        error ? "border-error" : "border-base-300",
      )}
    >
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        value={value}
        onChange={event => {
          const next = event.target.value.replace(",", ".");
          if (pattern.test(next)) onChange(next);
        }}
        className="h-14 min-w-0 flex-1 bg-transparent text-2xl font-semibold tabular-nums outline-none"
      />
      <span className="font-semibold text-base-content/60">{symbol}</span>
      {onMax && (
        <button
          type="button"
          onClick={onMax}
          className="rounded-pill bg-secondary px-3 py-1 text-xs font-semibold text-secondary-content"
        >
          Máx.
        </button>
      )}
    </div>
  );
};
