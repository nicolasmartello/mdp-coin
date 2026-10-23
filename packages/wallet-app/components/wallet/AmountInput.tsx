"use client";

import { cn } from "~~/lib/utils";

type AmountInputProps = {
  value: string;
  onChange: (value: string) => void;
  symbol: string;
  decimals: number;
  onMax?: () => void;
  invalid?: boolean;
  id?: string;
};

/**
 * Numeric amount field with the token symbol and an optional "Max" shortcut.
 * Only accepts digits and one dot (a comma becomes a dot), with at most `decimals` fractional digits,
 * so the value can always be parsed by viem's parseUnits.
 */
export const AmountInput = ({ value, onChange, symbol, decimals, onMax, invalid, id }: AmountInputProps) => {
  const pattern = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-card px-4 shadow-card transition-colors focus-within:border-ring",
        invalid && "border-destructive focus-within:border-destructive",
      )}
    >
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        aria-invalid={invalid}
        value={value}
        onChange={event => {
          const next = event.target.value.replace(",", ".");
          if (pattern.test(next)) onChange(next);
        }}
        className="h-14 min-w-0 flex-1 bg-transparent text-2xl font-light tabular-nums outline-none placeholder:text-muted-foreground/60"
      />
      <span className="text-sm font-medium text-muted-foreground">{symbol}</span>
      {onMax && (
        <button
          type="button"
          onClick={onMax}
          className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
        >
          Max
        </button>
      )}
    </div>
  );
};
