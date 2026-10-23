"use client";

import { type ReactNode } from "react";
import { cn } from "~~/utils/ui";

export type TabItem<T extends string> = {
  id: T;
  label: ReactNode;
};

type TabsProps<T extends string> = {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
};

/**
 * Underlined, full-width tabs. Controlled: the parent owns the selected tab.
 */
export const Tabs = <T extends string>({ items, value, onChange, className }: TabsProps<T>) => (
  <div role="tablist" className={cn("flex border-b border-base-300", className)}>
    {items.map(item => {
      const isActive = item.id === value;
      return (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(item.id)}
          className={cn(
            "-mb-px flex-1 border-b-2 py-3 text-sm font-semibold transition",
            isActive
              ? "border-primary text-primary"
              : "border-transparent text-base-content/60 hover:text-base-content",
          )}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);
