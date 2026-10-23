"use client";

import { AddressInput } from "@scaffold-ui/components";

type RecipientInputProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Scaffold-UI's AddressInput (address validation + ENS resolution + avatar),
 * restyled to match the rest of the wallet fields.
 */
export const RecipientInput = ({ value, onChange }: RecipientInputProps) => (
  <div className="[&>div]:overflow-hidden [&>div]:rounded-field [&>div]:border [&>div]:focus-within:border-primary [&_input]:h-12 [&_input]:font-mono [&_input]:text-sm">
    <AddressInput value={value} onChange={onChange} placeholder="Dirección 0x… o nombre ENS" />
  </div>
);
