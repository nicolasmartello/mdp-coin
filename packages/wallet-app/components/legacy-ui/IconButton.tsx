import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "~~/utils/ui";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  // Required: icon-only buttons need a text alternative for screen readers
  label: string;
  icon: ReactNode;
};

export const IconButton = ({ label, icon, className, type = "button", ...props }: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex size-10 shrink-0 items-center justify-center rounded-pill text-base-content transition",
      "hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40",
      "[&>svg]:size-6",
      className,
    )}
    {...props}
  >
    {icon}
  </button>
);
