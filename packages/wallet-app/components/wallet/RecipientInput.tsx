"use client";

import { AddressInput } from "@scaffold-ui/components";

type RecipientInputProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Scaffold-UI's AddressInput (address validation, ENS resolution, avatar),
 * restyled through the shared tokens to match the other wallet fields.
 */
export const RecipientInput = ({ value, onChange }: RecipientInputProps) => (
  <div className="[&>div]:overflow-hidden [&>div]:rounded-xl [&>div]:border [&>div]:shadow-card [&>div]:focus-within:border-ring [&_input]:h-12 [&_input]:font-mono [&_input]:text-sm">
    <AddressInput value={value} onChange={onChange} placeholder="0x… address or ENS name" />
  </div>
);
